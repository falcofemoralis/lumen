const tasks = new Map();
class DownloadTask {
  constructor(data) { Object.assign(this, data, { destination: window.lumen.file('path', data.destination) }); this.state ||= 'PENDING'; this.handlers = {}; }
  begin(fn) { this.handlers.begin = fn; return this; }
  progress(fn) { this.handlers.progress = fn; return this; }
  done(fn) { this.handlers.done = fn; return this; }
  error(fn) { this.handlers.error = fn; return this; }
  start() { window.lumen.downloadStart({ id: this.id, url: this.url, destination: this.destination, headers: this.headers, metadata: this.metadata }).catch(error => { this.state = 'FAILED'; this.handlers.error?.({ error: error.message }); }); this.state = 'DOWNLOADING'; return this; }
  pause() { this.state = 'PAUSED'; return window.lumen.downloadAction(this.id, 'pause'); }
  resume() { this.state = 'DOWNLOADING'; return window.lumen.downloadAction(this.id, 'resume'); }
  stop() { this.state = 'STOPPED'; return window.lumen.downloadAction(this.id, 'stop'); }
}
window.lumen.onDownload(event => {
  const task = tasks.get(event.id); if (!task) return;
  if (event.bytesDownloaded !== undefined) task.bytesDownloaded = event.bytesDownloaded; if (event.bytesTotal !== undefined) task.bytesTotal = event.bytesTotal;
  if (event.type === 'done') task.state = 'DONE'; if (event.type === 'error') task.state = 'FAILED';
  task.handlers[event.type]?.(event);
});
export const createDownloadTask = data => { const task = new DownloadTask(data); tasks.set(data.id, task); return task; };
export const getExistingDownloadTasks = async () => (await window.lumen.downloadList()).map(data => tasks.get(data.id) || createDownloadTask(data));
export const setConfig = options => window.lumen.downloadConfig(options.maxParallelDownloads || 4);
export const completeHandler = id => { tasks.delete(id); return window.lumen.downloadComplete(id); };
export { DownloadTask };
export default { createDownloadTask, getExistingDownloadTasks, setConfig, completeHandler };


