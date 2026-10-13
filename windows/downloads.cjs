const fs = require('node:fs'), path = require('node:path'), { Readable } = require('node:stream'), { pipeline } = require('node:stream/promises');
module.exports = ({ app, session, handle, send, checkedPath }) => {
  const savePath = path.join(app.getPath('userData'), 'download-jobs.json');
  let saved = {}; try { saved = JSON.parse(fs.readFileSync(savePath, 'utf8')); } catch {}
  const jobs = new Map(Object.entries(saved).map(([id, data]) => [id, { ...data, state: data.state === 'DOWNLOADING' ? 'PAUSED' : data.state }]));
  const publicJob = job => ({ id: job.id, url: job.url, destination: job.destination, metadata: job.metadata, headers: job.headers, state: job.state, bytesDownloaded: job.bytesDownloaded || 0, bytesTotal: job.bytesTotal || 0 });
  const persist = () => fs.writeFileSync(savePath, JSON.stringify(Object.fromEntries([...jobs].map(([id, job]) => [id, publicJob(job)]))));
  const cleanupStopped = job => {
    const temporary = checkedPath(job.destination + '.partial'), parts = checkedPath(job.destination + '.parts');
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (fs.existsSync(parts)) fs.rmSync(parts, { recursive: true, force: true });
    jobs.delete(job.id);
  };
  let running = 0, maximum = 4;
  const execute = async job => {
    running++; job.running = true; job.state = 'DOWNLOADING'; job.controller = new AbortController(); persist();
    const temporary = job.destination + '.partial';
    try {
      fs.mkdirSync(path.dirname(job.destination), { recursive: true });
      const offset = fs.existsSync(temporary) ? fs.statSync(temporary).size : 0;
      const response = await require('./media-fetch.cjs')(session, job.url, { headers: { ...job.headers, ...(offset ? { Range: 'bytes=' + offset + '-' } : {}) }, signal: job.controller.signal });
      if (!response.ok) throw new Error('Download HTTP ' + response.status);
      if (/dash\+xml/i.test(response.headers.get('content-type') || '') || /\.mpd(?:[?#]|$)/i.test(job.url)) {
        const result = await require('./dash-download.cjs').saveDash(job.url, job.destination,
          (url, options) => require('./media-fetch.cjs')(session, url, { ...options, headers: job.headers }),
          { signal: job.controller.signal, onProgress: data => send({ id: job.id, type: 'progress', ...data }) });
        Object.assign(job, result); job.state = 'DONE'; send({ id: job.id, type: 'done', ...result }); return;
      }
      if (/mpegurl/i.test(response.headers.get('content-type') || '') || /\.m3u8(?:[?#]|$)/i.test(job.url)) {
        const result = await require('./hls-download.cjs').saveHls(job.url, job.destination,
          (url, options) => require('./media-fetch.cjs')(session, url, { ...options, headers: job.headers }),
          { signal: job.controller.signal, onProgress: data => send({ id: job.id, type: 'progress', ...data }) });
        Object.assign(job, result); job.state = 'DONE'; send({ id: job.id, type: 'done', ...result }); return;
      }
      const append = offset > 0 && response.status === 206;
      job.bytesDownloaded = append ? offset : 0;
      job.bytesTotal = Number(response.headers.get('content-length') || 0) + job.bytesDownloaded;
      send({ id: job.id, type: 'begin', expectedBytes: job.bytesTotal });
      const reader = Readable.fromWeb(response.body);
      let last = 0;
      reader.on('data', chunk => {
        job.bytesDownloaded += chunk.length;
        if (Date.now() - last >= 250) { last = Date.now(); send({ id: job.id, type: 'progress', bytesDownloaded: job.bytesDownloaded, bytesTotal: job.bytesTotal }); }
      });
      await pipeline(reader, fs.createWriteStream(temporary, { flags: append ? 'a' : 'w' }));
      fs.renameSync(temporary, job.destination); job.state = 'DONE'; send({ id: job.id, type: 'done', bytesDownloaded: job.bytesDownloaded, bytesTotal: job.bytesTotal });
    } catch (error) {
      if (process.env.LUMEN_SMOKE_TEST) console.log('DOWNLOAD_ERROR ' + job.id + ' ' + new URL(job.url).hostname + ' ' + error.message);
      if (!['PAUSED', 'STOPPED'].includes(job.state)) { job.state = 'FAILED'; send({ id: job.id, type: 'error', error: error.message }); }
    } finally { running--; job.running = false; if (job.state === 'STOPPED') cleanupStopped(job); if (job.resumeAfter) { job.resumeAfter = false; job.state = 'PENDING'; } persist(); drain(); }
  };
  const drain = () => { for (const job of jobs.values()) if (job.state === 'PENDING' && !job.running && running < maximum) job.promise = execute(job); };
  handle('download:list', () => [...jobs.values()].filter(job => !['DONE','STOPPED'].includes(job.state)).map(publicJob));
  handle('download:complete', id => { if (['DONE','STOPPED'].includes(jobs.get(id)?.state)) { jobs.delete(id); persist(); } });
  handle('download:start', data => {
    if (typeof data.id !== 'string' || !data.id || data.id.length > 160 || /[\u0000-\u001f]/.test(data.id)) throw new Error('Invalid download ID');
    if (!['https:', 'http:'].includes(new URL(data.url).protocol)) throw new Error('Unsupported download URL');
    const destination = checkedPath(data.destination);
    if (fs.existsSync(destination) && fs.statSync(destination).isDirectory()) throw new Error('Download destination must be a file');
    const old = jobs.get(data.id); if (old?.state === 'DOWNLOADING') return;
    const job = { ...data, destination, state: 'PENDING' }; jobs.set(data.id, job); persist(); drain();
  });
  handle('download:action', async (id, action) => {
    const job = jobs.get(id); if (!job) return;
    if (action === 'pause' || action === 'stop') { job.resumeAfter = false; job.state = action === 'pause' ? 'PAUSED' : 'STOPPED'; job.controller?.abort(); if (job.promise) await job.promise; if (action === 'stop' && jobs.has(id)) cleanupStopped(job); }
    if (action === 'resume') { if (job.running) job.resumeAfter = true; else { job.state = 'PENDING'; drain(); } }
    persist();
  });
  handle('download:config', value => { maximum = Math.max(1, Math.min(8, value)); drain(); });
};
