import { TaskIdStorage as base } from '../util/Download';
export * from '../util/Download';
const canonical = value => {
  if (!value || /^https?:/.test(value)) return value;
  try { return window.lumen.file('path', value); } catch { return value; }
};
const record = data => ({ ...data, destination: canonical(data.destination), folder: canonical(data.folder),
  film: data.film ? { ...data.film, poster: canonical(data.film.poster) } : data.film,
  subtitles: data.subtitles?.map(item => ({ ...item, url: canonical(item.url) }))
});
export const getDownloadsDir = path => {
  try { return window.lumen.file('path', path || window.lumen.paths.downloads); } catch { return window.lumen.paths.downloads; }
};
export const formatDestination = uri => canonical(uri);
export const TaskIdStorage = {
  ...base,
  load() {
    const original = base.load(), normalized = Object.fromEntries(Object.entries(original).map(([key, value]) => { const data = record(value); return [data.destination || canonical(key), data]; }));
    if (JSON.stringify(original) !== JSON.stringify(normalized)) base.save(normalized);
    return normalized;
  },
  getOrCreate(destination, data) { this.load(); return base.getOrCreate(canonical(destination), record(data)); },
  setComplete(destination) { base.setComplete(canonical(destination)); },
  clear(destination) { base.clear(canonical(destination)); }
};

