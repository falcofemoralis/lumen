const { contextBridge, ipcRenderer } = require('electron');
const invoke = name => (...args) => ipcRenderer.invoke(name, ...args);
contextBridge.exposeInMainWorld('lumen', {
  awake: invoke('awake'),
  action: invoke('window:action'), fetch: invoke('fetch'), abortFetch: invoke('fetch:abort'), media: invoke('media'),
  downloadComplete: invoke('download:complete'),
  downloadStart: invoke('download:start'), downloadList: invoke('download:list'), downloadAction: invoke('download:action'), downloadConfig: invoke('download:config'),
  onDownload: callback => { const listener = (_, value) => callback(value); ipcRenderer.on('download:event', listener); return () => ipcRenderer.removeListener('download:event', listener); },
  storageLoad: id => ipcRenderer.sendSync('storage:load', id), storageSave: (id, value) => ipcRenderer.sendSync('storage:save', id, value),
  diagnostic: ipcRenderer.sendSync('diagnostic'),
  application: ipcRenderer.sendSync('application'),
  flushCookies: invoke('cookies:flush'),
  paths: ipcRenderer.sendSync('paths'),
  onGooglePhase: callback => { const listener = (_, phase) => callback(phase); ipcRenderer.on('oauth:phase', listener); return () => ipcRenderer.removeListener('oauth:phase', listener); },
  googleCurrent: () => ipcRenderer.sendSync('oauth:current'), googleSignIn: invoke('oauth:signin'), googleTokens: invoke('oauth:tokens'), googleInvalidate: invoke('oauth:invalidate'), googleSignOut: invoke('oauth:signout'),
  file: (action, path, value) => { const result = ipcRenderer.sendSync('file', action, path, value); if (result?.error) throw new Error(result.error); return result; },
  chooseFile: invoke('file:choose'), chooseDirectory: invoke('directory:choose'), openFolder: invoke('folder:open'),
  cookies: invoke('cookies:get'), clearCookies: invoke('cookies:clear'), removeCookies: invoke('cookies:remove'),
  openWebView: invoke('webview:open'), injectWebView: invoke('webview:inject'), closeWebView: invoke('webview:close'), openExternal: invoke('shell:open'),
  onFullscreen: callback => { const listener = (_, value) => callback(value); ipcRenderer.on('window:fullscreen', listener); return () => ipcRenderer.removeListener('window:fullscreen', listener); },
  onWebView: callback => { const listener = (_, value) => callback(value); ipcRenderer.on('webview:event', listener); return () => ipcRenderer.removeListener('webview:event', listener); }
});
