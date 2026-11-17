const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ReactNativeWebView', { postMessage: message => ipcRenderer.send('webview:message', String(message)) });
