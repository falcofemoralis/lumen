const fs = require('node:fs'), path = require('node:path');
const { DOMParser, XMLSerializer } = (() => { try { return require('./xml.cjs'); } catch { return require('@xmldom/xmldom'); } })();
const elements = (node, name) => Array.from(node.childNodes || []).filter(item => item.nodeType === 1 && (!name || item.localName === name));
const child = (node, name) => elements(node, name)[0];
const seconds = text => {
  const match = String(text || '').match(/^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/);
  return match ? Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0) : 0;
};
const inherited = (node, name) => { for (let current = node; current?.nodeType === 1; current = current.parentNode) { const item = child(current, name); if (item) return item; } };
const baseFor = (node, url) => {
  const parents = []; for (let current = node; current?.nodeType === 1; current = current.parentNode) parents.unshift(current);
  for (const parent of parents) { const base = child(parent, 'BaseURL'); if (base) url = new URL(base.textContent.trim(), url).href; }
  return url;
};
const substitute = (pattern, values) => pattern.replace(/\$\$/g, '\u0000').replace(/\$(RepresentationID|Bandwidth|Number|Time)(?:%0(\d+)d)?\$/g,
  (_, key, width) => String(values[key]).padStart(Number(width || 0), '0')).replace(/\u0000/g, '$');
async function saveDash(url, destination, fetch, { signal, onProgress = () => {} } = {}) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('DASH manifest HTTP ' + response.status);
  const doc = new DOMParser().parseFromString(await response.text(), 'application/xml'), mpd = doc.documentElement;
  if (mpd.localName !== 'MPD' || mpd.getAttribute('type') === 'dynamic') throw new Error('A complete VOD DASH manifest is required');
  if (mpd.getElementsByTagName('ContentProtection').length) throw new Error('Protected DASH downloads are not supported');
  const resources = new Map(), directory = destination + '.parts';
  const resource = remote => { if (!resources.has(remote)) resources.set(remote, path.basename(directory) + '/resource-' + resources.size + '.bin'); return resources.get(remote); };
  for (const period of elements(mpd, 'Period')) {
    const duration = seconds(period.getAttribute('duration')) || seconds(mpd.getAttribute('mediaPresentationDuration'));
    for (const adaptation of elements(period, 'AdaptationSet')) {
      const reps = elements(adaptation, 'Representation').sort((a, b) => Number(b.getAttribute('bandwidth')) - Number(a.getAttribute('bandwidth')));
      const rep = reps[0]; if (!rep) continue;
      for (const other of reps.slice(1)) adaptation.removeChild(other);
      const template = inherited(rep, 'SegmentTemplate');
      if (!template) throw new Error('This DASH segment layout is not supported for offline playback');
      const attr = name => template.getAttribute(name), scale = Number(attr('timescale') || 1), segmentDuration = Number(attr('duration'));
      const start = Number(attr('startNumber') || 1), entries = [], timeline = child(template, 'SegmentTimeline');
      if (timeline) {
        let time = 0;
        const rows = elements(timeline, 'S');
        rows.forEach((row, index) => {
          if (row.hasAttribute('t')) time = Number(row.getAttribute('t'));
          const d = Number(row.getAttribute('d')), repeat = Number(row.getAttribute('r') || 0);
          if (!(d > 0)) throw new Error('Invalid DASH timeline');
          const nextTime = rows[index + 1]?.getAttribute('t');
          const end = nextTime ? Number(nextTime) : duration * scale + Number(attr('presentationTimeOffset') || 0);
          const count = repeat < 0 ? Math.ceil((end - time) / d) : repeat + 1;
          if (count < 0 || count > 50000 || entries.length + count > 50000) throw new Error('DASH segment limit exceeded');
          for (let n = 0; n < count; n++) { entries.push({ time, d }); time += d; }
        });
      } else {
        if (!(duration > 0 && segmentDuration > 0)) throw new Error('DASH duration is unavailable');
        const count = Math.ceil(duration * scale / segmentDuration);
        if (count > 50000) throw new Error('DASH segment limit exceeded');
        for (let n = 0; n < count; n++) entries.push({ time: n * segmentDuration, d: segmentDuration });
      }
      const base = baseFor(rep, url), values = { RepresentationID: rep.getAttribute('id'), Bandwidth: rep.getAttribute('bandwidth') };
      const list = doc.createElementNS(mpd.namespaceURI, 'SegmentList'); list.setAttribute('timescale', String(scale));
      if (attr('presentationTimeOffset')) list.setAttribute('presentationTimeOffset', attr('presentationTimeOffset'));
      const timing = doc.createElementNS(mpd.namespaceURI, 'SegmentTimeline');
      if (attr('initialization')) { const init = doc.createElementNS(mpd.namespaceURI, 'Initialization'); init.setAttribute('sourceURL', resource(new URL(substitute(attr('initialization'), values), base).href)); list.appendChild(init); }
      for (let n = 0; n < entries.length; n++) {
        const entry = entries[n], row = doc.createElementNS(mpd.namespaceURI, 'S'); row.setAttribute('t', String(entry.time)); row.setAttribute('d', String(entry.d)); timing.appendChild(row);
      }
      list.appendChild(timing);
      for (let n = 0; n < entries.length; n++) {
        const segment = doc.createElementNS(mpd.namespaceURI, 'SegmentURL');
        segment.setAttribute('media', resource(new URL(substitute(attr('media'), { ...values, Number: start + n, Time: entries[n].time }), base).href)); list.appendChild(segment);
      }
      rep.appendChild(list);
    }
  }
  for (const name of ['BaseURL', 'SegmentTemplate']) for (const element of Array.from(mpd.getElementsByTagName(name))) element.parentNode.removeChild(element);
  if (!resources.size) throw new Error('Empty DASH manifest');
  fs.mkdirSync(directory, { recursive: true }); let bytes = 0, count = 0;
  for (const [remote, relative] of resources) {
    signal?.throwIfAborted(); const file = path.join(path.dirname(destination), relative);
    if (!fs.existsSync(file)) { const result = await fetch(remote, { signal }); if (!result.ok) throw new Error('DASH segment HTTP ' + result.status); fs.writeFileSync(file + '.tmp', Buffer.from(await result.arrayBuffer())); fs.renameSync(file + '.tmp', file); }
    bytes += fs.statSync(file).size; count++; onProgress({ bytesDownloaded: bytes, bytesTotal: Math.ceil(bytes / count * resources.size) });
  }
  fs.writeFileSync(destination + '.partial', new XMLSerializer().serializeToString(doc)); fs.renameSync(destination + '.partial', destination);
  return { bytesDownloaded: bytes, bytesTotal: bytes };
}
module.exports = { saveDash };
