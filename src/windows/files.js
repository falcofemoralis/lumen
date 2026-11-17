export const Paths = { cache: window.lumen.paths.cache, document: window.lumen.paths.data };
export class File {
  constructor(...parts) { this.path = parts.map(part => part.path || part).join('/'); }
  get uri() { return window.lumen.file('uri', this.path); }
  get exists() { return window.lumen.file('exists', this.path); }
  get size() { return window.lumen.file('size', this.path); }
  write(value) { return window.lumen.file('write', this.path, value); }
  delete() { return window.lumen.file('delete', this.path); }
  text() { return Promise.resolve(window.lumen.file('read', this.path)); }
  static async pickFileAsync() { const path = await window.lumen.chooseFile(); return path ? { canceled: false, result: new File(path) } : { canceled: true }; }
}
export class Directory {
  constructor(...parts) { this.path = parts.map(part => part.path || part).join('/'); }
  get uri() { return window.lumen.file('uri', this.path); }
  get exists() { return window.lumen.file('exists', this.path); }
  create() { return window.lumen.file('mkdir', this.path); }
  list() { return window.lumen.file('list', this.path).map(item => item.directory ? new Directory(item.path) : new File(item.path)); }
  delete() { return window.lumen.file('rmdir', this.path); }
}
export const StorageAccessFramework = {
  requestDirectoryPermissionsAsync: async () => { const directoryUri = await window.lumen.chooseDirectory(); return { granted: !!directoryUri, directoryUri }; },
  createFileAsync: async (directory, name) => directory + '/' + name,
  writeAsStringAsync: async (path, value) => window.lumen.file('write', path, value)
};
export const readAsStringAsync = async path => window.lumen.file('read', path);
export const writeAsStringAsync = async (path, value) => window.lumen.file('write', path, value);
export const deleteAsync = async path => window.lumen.file('delete', path);


