const { app, BrowserWindow, ipcMain, session, shell, protocol, net } = require('electron');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const desktopIdentity = require('./shell-identity.cjs');
if (process.platform === 'win32') app.setAppUserModelId(desktopIdentity.APP_ID);
protocol.registerSchemesAsPrivileged([{ scheme: 'lumen-file', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }, { scheme: 'lumen', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }, { scheme: 'lumen-media', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
const portableRoot = process.env.PORTABLE_EXECUTABLE_DIR || (app.isPackaged ? path.dirname(app.getPath('exe')) : __dirname);
const dataRoot = process.env.LUMEN_SMOKE_MODE ? path.join(__dirname, 'smoke-data-' + (process.env.LUMEN_SMOKE_MODE === 'downloads' ? 'offline' : process.env.LUMEN_SMOKE_MODE)) : path.join(portableRoot, 'data');
fs.mkdirSync(dataRoot, { recursive: true });
app.setPath('userData', dataRoot);
require('./portable-data.cjs')(dataRoot);
try {
  const configPath = path.join(dataRoot, 'config.json');
  const stored = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const device = JSON.parse(stored.deviceConfig || '{}');
  // Old Windows profiles inherited the Android default without an explicit choice.
  if (!Object.hasOwn(device, 'showRatings') || !Object.hasOwn(device, 'recentTabsInterface')) {
    if (!Object.hasOwn(device, 'showRatings')) device.showRatings = true;
    if (!Object.hasOwn(device, 'recentTabsInterface')) device.recentTabsInterface = device.newHomeInterface ?? true;
    fs.writeFileSync(configPath, JSON.stringify({ ...stored, deviceConfig: JSON.stringify(device) }));
  }
} catch { /* First launch config is created by onboarding. */ }
if (['home','film','sources','anime','rezka','updates','offline','downloads','desktop-info','desktop-google','desktop-ui'].includes(process.env.LUMEN_SMOKE_MODE)) fs.writeFileSync(path.join(dataRoot, 'config.json'), JSON.stringify({
  ...(process.env.LUMEN_SMOKE_REZKA_MIRROR ? { rezkaConfig: JSON.stringify({officialMode: false, provider: process.env.LUMEN_SMOKE_REZKA_MIRROR}) } : {}),
  deviceConfig: JSON.stringify({ ...(process.env.LUMEN_SMOKE_SIDEBAR === '1' ? { accentColor: '#FF8800' } : {}), ...(process.env.LUMEN_SMOKE_ATV_AUDIT === '1' ? { recentDisplayMode: 'grid' } : {}), isConfigured: true, showRatings: true, isTV: process.env.LUMEN_SMOKE_TV === '1', isLocalLibrary: true, enabledSources: ['ZONA','REZKA','ANIXART'], newHomeInterface: true, recentTabsInterface: true, tabPosition: 'top', numberOfColumnsMobile: 6 })
}));
if (process.env.LUMEN_SMOKE_MODE === 'desktop-ui') fs.writeFileSync(path.join(dataRoot, 'localLibrary.json'), JSON.stringify({
  localBookmarks: JSON.stringify({ categories: [{ id: 'ui-one', title: 'Первая папка', filmIds: [], createdAt: 1 }, { id: 'ui-two', title: 'Вторая папка', filmIds: [], createdAt: 2 }], films: {} }),
  localHistory: JSON.stringify(Array.from({ length: 8 }, (_, i) => {
    const poster = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../assets/images/app-icon-all.png')).toString('base64');
    const card = { id: 'recent-fixture-' + i, link: 'https://w1.zona.im/movies/mstiteli-final', poster, title: 'История ' + (i + 1), subtitle: '2019', type: 'FILM', ratings: { imdb: 8.4 } };
    return { id: card.id, link: card.link, poster, title: card.title, filmCard: card, updatedAt: Date.now() - i * 1000, isWatched: false };
  }))
}));
let main;
const sendToMain = require('./window-events.cjs')(() => main);
if (!process.env.LUMEN_SMOKE_TEST) {
  if (!app.requestSingleInstanceLock()) app.quit();
  app.on('second-instance', () => { if (main) { if (main.isMinimized()) main.restore(); main.show(); main.focus(); } });
}
const children = new Map(), media = new Map(), mediaHeaders = new Map();
const storagePath = id => {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) throw new Error('Invalid storage ID');
  return path.join(dataRoot, id + '.json');
};
const loadStore = id => { try { return JSON.parse(fs.readFileSync(storagePath(id), 'utf8')); } catch { return {}; } };
const assertSender = event => { if (event.sender !== main?.webContents) throw new Error('Untrusted IPC sender'); };
const remoteURL = value => { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported URL'); return url.href; };
const handle = (name, fn) => ipcMain.handle(name, (event, ...args) => { assertSender(event); return fn(...args); });
const proxyURL = (id, url) => 'lumen-media://' + id + '/?url=' + encodeURIComponent(url);
app.whenReady().then(async () => {
  require('electron').Menu.setApplicationMenu(null);
  protocol.handle('lumen', request => {
    const url = new URL(request.url), root = path.join(__dirname, 'web');
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) return new Response('', { status: 403 });
    return net.fetch(require('node:url').pathToFileURL(file).href);
  });
  protocol.handle('lumen-media', async request => {
    const url = new URL(request.url), item = media.get(url.hostname);
    if (!item) return new Response('', { status: 404 });
    const target = remoteURL(url.searchParams.get('url')), headers = { ...item.headers };
    if (request.headers.get('range')) headers.Range = request.headers.get('range');
    const response = await require('./media-fetch.cjs')(session, target, { headers });
    if (process.env.LUMEN_SMOKE_TEST) console.log('MEDIA_HTTP ' + response.status + ' ' + response.headers.get('content-type') + ' ' + target);
    const resultHeaders = new Headers(response.headers); resultHeaders.set('access-control-allow-origin', '*');
    resultHeaders.delete('content-encoding');
    if (/\.srt(?:[?#]|$)/i.test(target)) {
      const text = 'WEBVTT\n\n' + (await response.text()).replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
      return new Response(text, { status: response.status, headers: { 'Content-Type': 'text/vtt', 'Access-Control-Allow-Origin': '*' } });
    }
    if (/mpegurl/i.test(response.headers.get('content-type') || '') || /\.m3u8(?:[?#]|$)/i.test(target)) {
      const playlist = (await response.text()).split('\n').map(line => {
        if (line.trim() && !line.startsWith('#')) return proxyURL(url.hostname, new URL(line.trim(), target).href);
        return line.replace(/URI="([^"]+)"/g, (_, uri) => 'URI="' + proxyURL(url.hostname, new URL(uri, target).href) + '"');
      }).join('\n');
      resultHeaders.delete('content-length');
      return new Response(playlist, { status: response.status, headers: resultHeaders });
    }
    return new Response(response.body, { status: response.status, headers: resultHeaders });
  });
  if (process.env.LUMEN_SMOKE_TEST) session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.includes('interkh.com')) console.log('MEDIA_UA ' + JSON.stringify(details.requestHeaders));
    callback({ requestHeaders: details.requestHeaders });
  });
  main = new BrowserWindow({ width: 1280, height: 850, minWidth: 800, minHeight: 550, backgroundColor: '#000000', frame: false, show: false, autoHideMenuBar: true,
    icon: path.join(__dirname, '../assets/images/app-icon-all.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, autoplayPolicy: 'no-user-gesture-required' } });
  if (process.platform === 'win32' && app.isPackaged) {
    const launcher = process.env.PORTABLE_EXECUTABLE_FILE || app.getPath('exe');
    main.setAppDetails(desktopIdentity.windowDetails(launcher));
    try { desktopIdentity.ensureShortcut({ shell, fs, executable: launcher, root: portableRoot }); }
    catch (error) { console.warn('[Desktop] Could not create Lumen shortcut:', error.message); }
  }
  main.webContents.on('console-message', event => console.log('RENDERER: ' + event.message));
  if (process.env.LUMEN_SMOKE_TEST) {
    main.webContents.debugger.attach('1.3');
    main.webContents.debugger.on('message', (_event, method, params) => {
      if (method === 'Runtime.exceptionThrown') console.log('RENDERER_EXCEPTION ' + JSON.stringify(params.exceptionDetails));
    });
    void main.webContents.debugger.sendCommand('Runtime.enable').catch(() => {});
  }
  main.webContents.on('render-process-gone', (_event, details) => console.log('RENDERER_GONE ' + JSON.stringify(details)));
  const desktopFiles = require('./files.cjs')({ app, ipcMain, dialog: require('electron').dialog, shell, protocol, net, handle, assertSender });
  require('./downloads.cjs')({ app, session, handle, checkedPath: desktopFiles.checkedPath, send: event => sendToMain('download:event', event) });
  require('./oauth.cjs')({ app, shell, safeStorage: require('electron').safeStorage, handle, ipcMain, assertSender, session, getWindow: () => main, sendPhase: phase => sendToMain('oauth:phase', phase) });
  main.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  main.webContents.on('will-navigate', (event, url) => { if (!url.startsWith('lumen://app/')) { event.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  main.on('closed', () => { main = null; });
  main.on('enter-full-screen', () => sendToMain('window:fullscreen', true));
  main.on('leave-full-screen', () => sendToMain('window:fullscreen', false));
  ipcMain.on('application', event => { assertSender(event); event.returnValue = { version: app.getVersion() }; });
  ipcMain.on('diagnostic', event => { assertSender(event); event.returnValue = !!process.env.LUMEN_SMOKE_TEST; });
  const awakeTags = new Map(), { powerSaveBlocker } = require('electron');
  handle('awake', (tag, active) => {
    if (active && !awakeTags.has(tag)) awakeTags.set(tag, powerSaveBlocker.start('prevent-display-sleep'));
    if (!active && awakeTags.has(tag)) { powerSaveBlocker.stop(awakeTags.get(tag)); awakeTags.delete(tag); }
  });
  const miniWindowAction = require('./mini-window.cjs')({ window: main, screen: require('electron').screen, dataRoot });
  handle('window:action', async action => {
    if (await miniWindowAction(action)) return;
    if (!main || main.isDestroyed()) return;
    if (action === 'minimize') main.minimize();
    else if (action === 'maximize') main.isMaximized() ? main.unmaximize() : main.maximize();
    else if (action === 'fullscreen') main.setFullScreen(!main.isFullScreen());
    else if (action === 'close') main.close();
  });
  require('./http.cjs')({ session, handle });
  handle('media', (url, headers) => {
    const id = crypto.randomBytes(16).toString('hex'); media.set(id, { url: remoteURL(url), headers: headers || {} });
    mediaHeaders.set(new URL(url).origin, headers || {});
    if (media.size > 100) media.delete(media.keys().next().value);
    return proxyURL(id, url);
  });
  ipcMain.on('storage:load', (event, id) => { assertSender(event); event.returnValue = loadStore(id); });
  ipcMain.on('storage:save', (event, id, value) => {
    assertSender(event);
    try { const file = storagePath(id); fs.writeFileSync(file + '.tmp', JSON.stringify(value)); fs.renameSync(file + '.tmp', file); event.returnValue = true; }
    catch { event.returnValue = false; }
  });
  handle('storage:save-async', (id, value) => {
    const file = storagePath(id);
    fs.writeFileSync(file + '.tmp', JSON.stringify(value));
    fs.renameSync(file + '.tmp', file);
    return true;
  });
  handle('cookies:get', async url => (await session.defaultSession.cookies.get({ url: remoteURL(url) })).map(cookie => cookie.name + '=' + cookie.value).join('; '));
  handle('cookies:flush', () => session.defaultSession.cookies.flushStore());
  handle('cookies:clear', async () => { await session.defaultSession.clearStorageData({ storages: ['cookies'] }); return true; });
  handle('cookies:remove', async (url, names) => {
    for (const cookie of await session.defaultSession.cookies.get({ url: remoteURL(url) }))
      if (names.includes(cookie.name)) await session.defaultSession.cookies.remove(url, cookie.name);
    return true;
  });
  handle('webview:open', ({ id, url, hidden, userAgent, injected }) => {
    children.get(id)?.close();
    const child = new BrowserWindow({ parent: main, icon: path.join(__dirname, '../assets/images/app-icon-all.png'), width: 1000, height: 720, show: !hidden, backgroundColor: '#000000',
      webPreferences: { preload: path.join(__dirname, 'remote-preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false } });
    children.set(id, child);
    if (process.env.LUMEN_SMOKE_TEST) child.webContents.on('did-fail-load', (_event, code, description) => console.log('WEBVIEW_LOAD_ERROR ' + code + ' ' + description));
    if (userAgent) child.webContents.setUserAgent(userAgent);
    child.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    child.webContents.on('did-finish-load', async () => {
      try { if (injected) await child.webContents.executeJavaScript(injected); sendToMain('webview:event', { id, type: 'load' }); }
      catch (error) { sendToMain('webview:event', { id, type: 'error', message: error.message }); }
    });
    child.on('closed', () => { children.delete(id); sendToMain('webview:event', { id, type: 'closed' }); });
    child.loadURL(remoteURL(url)); return true;
  });
  ipcMain.on('webview:message', (event, message) => {
    const entry = [...children].find(([, child]) => child.webContents === event.sender);
    if (entry) {
      if (process.env.LUMEN_SMOKE_TEST) { try { console.log('WEBVIEW_EVENT ' + JSON.parse(message).type); } catch {} }
      sendToMain('webview:event', { id: entry[0], type: 'message', message });
    }
  });
  handle('webview:inject', (id, script) => children.get(id)?.webContents.executeJavaScript(script));
  handle('webview:close', id => children.get(id)?.close());
  handle('shell:open', url => shell.openExternal(remoteURL(url)));
  await main.loadURL('lumen://app/'); main.show();
  if (process.env.LUMEN_SMOKE_MODE === 'desktop-ui') {
    const run = async () => {
      if (app.isPackaged) {
        const shortcut = shell.readShortcutLink(path.join(portableRoot, 'Lumen.lnk'));
        if (shortcut.appUserModelId !== desktopIdentity.APP_ID || shortcut.target !== (process.env.PORTABLE_EXECUTABLE_FILE || app.getPath('exe'))) throw new Error('Desktop shortcut identity regression');
        console.log('UI_SHORTCUT_IDENTITY ' + JSON.stringify({ id: shortcut.appUserModelId, target: shortcut.target }));
      }
      const evaluate = script => main.webContents.executeJavaScript(script);
      const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
      const swipe = async () => {
        const point = await evaluate("(()=>{const e=[...document.querySelectorAll('[data-lumen-pager]')].find(e=>e.getBoundingClientRect().width>0); const r=e.getBoundingClientRect(); return {x:Math.round(r.x+r.width*.65),y:Math.round(r.y+r.height*.4)};})()");
        main.webContents.sendInputEvent({ type: 'mouseDown', ...point, button: 'left', clickCount: 1 });
        main.webContents.sendInputEvent({ type: 'mouseMove', x: point.x - 200, y: point.y, button: 'left' });
        main.webContents.sendInputEvent({ type: 'mouseUp', x: point.x - 200, y: point.y, button: 'left', clickCount: 1 });
        await pause(500);
      };
      if (process.env.LUMEN_SMOKE_DETAIL_DRAG === '1') {
        const history = JSON.parse(JSON.parse(fs.readFileSync(path.join(dataRoot, 'localLibrary.json'), 'utf8')).localHistory);
        const card = history[0].filmCard;
        const link = 'https://w1.zona.im/movies/ui-detail-drag';
        const film = { ...card, id: 'ui-detail-drag', link, title: 'Проверка перетаскивания', description: 'Описание для проверки выделения.', voices: [], ratings: [], hasSeasons: false, hasVoices: false,
          actors: Array.from({length:20},(_,i)=>({name:'Актёр '+(i+1),photo:card.poster,link:'/person-'+i})), directors: [],
          related: Array.from({length:20},(_,i)=>({...card,id:'related-'+i,title:'Похожий '+(i+1),link:'/related-'+i})) };
        await evaluate('window.lumenDiagnostics.previewFilm('+JSON.stringify(film)+')'); await pause(900);
        const results = [];
        for (const text of ['Актёр 3','Похожий 3']) {
          await evaluate(`(()=>{const leaf=[...document.querySelectorAll('[data-lumen-selectable]')].find(e=>e.textContent===${JSON.stringify(text)});leaf.closest('[data-lumen-drag-scroll]').scrollIntoView({block:'center'});})()`);
          await pause(600);
          const point = await evaluate(`(()=>{const leaf=[...document.querySelectorAll('[data-lumen-selectable]')].find(e=>e.textContent===${JSON.stringify(text)});const row=leaf.closest('[data-lumen-drag-scroll]');row.dataset.dragTest='active';const r=leaf.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),before:row.scrollLeft,select:getComputedStyle(leaf).userSelect};})()`);
          if (point.select!=='none') throw new Error('Carousel text remains selectable');
          main.webContents.sendInputEvent({type:'mouseDown',x:point.x,y:point.y,button:'left',clickCount:1});
          for(let i=1;i<=4;i++) {main.webContents.sendInputEvent({type:'mouseMove',x:point.x-i*30,y:point.y,button:'left'});await pause(50);}
          main.webContents.sendInputEvent({type:'mouseUp',x:point.x-120,y:point.y,button:'left',clickCount:1});
          await pause(400);
          const after = await evaluate("document.querySelector('[data-drag-test=active]').scrollLeft");
          if(after<=point.before)throw new Error('Carousel mouse drag did not scroll: '+text);
          if(await evaluate('window.lumenDiagnostics.currentRouteLink()')!==link)throw new Error('Carousel drag opened a card');
          await evaluate("document.querySelector('[data-drag-test=active]').removeAttribute('data-drag-test')");
          results.push({text,before:point.before,after});
        }
        const descriptionSelect=await evaluate("getComputedStyle([...document.querySelectorAll('[data-lumen-selectable]')].find(e=>e.textContent==='Описание для проверки выделения.')).userSelect");
        if(descriptionSelect!=='text')throw new Error('Description selection was disabled');
        console.log('UI_DETAIL_DRAG '+JSON.stringify({results,descriptionSelect,tv:process.env.LUMEN_SMOKE_TV==='1'}));
        return;
      }
      if (process.env.LUMEN_SMOKE_SIDEBAR === '1') {
        if (process.env.LUMEN_SMOKE_SMALL_UI === '1') {main.setSize(800,480);await pause(700);}
        const click = async id => {
          const point = await evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});const r=e.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()`);
          main.webContents.sendInputEvent({type:'mouseDown',...point,button:'left',clickCount:1});
          main.webContents.sendInputEvent({type:'mouseUp',...point,button:'left',clickCount:1});
          await pause(700);
        };
        const snapshot = () => evaluate(`(()=>{const bar=document.getElementById('atv-navigation-sidebar').getBoundingClientRect();const scene=[...document.querySelectorAll('#atv-navigation-scene')].find(e=>e.getBoundingClientRect().width>0).getBoundingClientRect();const tabs=[...document.querySelectorAll('[id^="sidebar-item-"]')].map(e=>({id:e.id,bg:getComputedStyle(e).backgroundColor,stroke:e.querySelector('svg')?.getAttribute('stroke')}));return {width:bar.width,x:scene.x,right:scene.right,sceneWidth:scene.width,viewport:innerWidth,tabs};})()`);
        const before = await snapshot();
        await click('sidebar-item-Bookmarks-tab');
        const clicked = await snapshot();
        if (clicked.width !== before.width) throw new Error('Sidebar expanded after icon click');
        if (clicked.tabs.filter(t=>t.stroke?.toLowerCase()==='#ff8800').length !== 1 || !clicked.tabs.some(t=>t.id==='sidebar-item-Bookmarks-tab' && t.stroke?.toLowerCase()==='#ff8800')) throw new Error('Sidebar icon accent selection regression');
        if (clicked.tabs.some(t=>t.bg!=='rgba(0, 0, 0, 0)')) throw new Error('Sidebar retained colored backgrounds');
        await click('sidebar-menu-toggle');
        const opened = await snapshot();
        if (opened.width <= before.width || Math.abs(opened.x-opened.width)>1) throw new Error('Sidebar does not push the scene');
        if (opened.right > opened.viewport + 1) throw new Error('Sidebar clips the scene right edge: '+JSON.stringify(opened));
        await click('sidebar-menu-toggle');
        const closed = await snapshot();
        if (closed.width !== before.width || Math.abs(closed.x-before.x)>1) throw new Error('Sidebar scene did not return');
        await evaluate('window.lumenDiagnostics.focusSidebar()'); await pause(700);
        const remote = await snapshot();
        if (remote.width <= before.width || remote.tabs.filter(t=>t.stroke?.toLowerCase()==='#ff8800').length!==1) throw new Error('Remote sidebar focus regression');
        if (process.env.LUMEN_SMOKE_SMALL_UI === '1') {
          await evaluate("window.lumenDiagnostics.focus('sidebar-tab-Settings')");await pause(700);
          const settingsBounds=await evaluate("(()=>{const item=document.getElementById('sidebar-item-Settings').getBoundingClientRect(),bar=document.getElementById('atv-navigation-sidebar').getBoundingClientRect();return {itemBottom:item.bottom,barBottom:bar.bottom};})()");
          if(settingsBounds.itemBottom>settingsBounds.barBottom+1)throw new Error('Small sidebar clips its last item');
          console.log('UI_SMALL_SIDEBAR '+JSON.stringify(settingsBounds));
        }
        console.log('UI_SIDEBAR '+JSON.stringify({before,clicked,opened,closed,remote}));
        return;
      }
      if (process.env.LUMEN_SMOKE_FOLDER_DRAG === '1') {
        await evaluate("window.lumenDiagnostics.tab('Bookmarks-tab')"); await pause(800);
        const opened = await evaluate(`(()=>{const icon=[...document.querySelectorAll('svg circle[cx="18"][cy="18"][r="3"]')].map(e=>e.closest('svg')).find(e=>e.getBoundingClientRect().width>0);if(!icon)return false;icon.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true;})()`);
        if (!opened) throw new Error('Folder manager not found');
        await pause(800);
        const order = () => evaluate("[...document.querySelectorAll('[data-lumen-folder-drop]')].map(e=>e.dataset.lumenFolderDrop)");
        const before = await order();
        const dragFolder = async (source, target) => {
          const points = await evaluate(`(()=>{const point=e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}};return {from:point(document.querySelector('[data-lumen-folder-drag-handle="'+${JSON.stringify(source)}+'"]')),to:point(document.querySelector('[data-lumen-folder-drop="'+${JSON.stringify(target)}+'"]'))};})()`);
          let dragData;
          const intercept = (_event, method, params) => { if (method === 'Input.dragIntercepted') dragData = params.data; };
          main.webContents.debugger.on('message', intercept);
          try {
            await main.webContents.debugger.sendCommand('Input.setInterceptDrags', { enabled: true });
            await main.webContents.debugger.sendCommand('Input.dispatchMouseEvent', { type: 'mouseMoved', ...points.from });
            await main.webContents.debugger.sendCommand('Input.dispatchMouseEvent', { type: 'mousePressed', ...points.from, button: 'left', buttons: 1, clickCount: 1 });
            await main.webContents.debugger.sendCommand('Input.dispatchMouseEvent', { type: 'mouseMoved', x: points.from.x + 12, y: points.from.y + 12, button: 'left', buttons: 1 });
            await main.webContents.debugger.sendCommand('Input.dispatchMouseEvent', { type: 'mouseMoved', ...points.to, button: 'left', buttons: 1 });
            for (let attempt = 0; !dragData && attempt < 10; attempt++) await pause(100);
            if (!dragData?.items.some(item => item.mimeType === 'application/x-lumen-bookmark-category')) throw new Error('Mouse did not start a native folder drag');
            for (const type of ['dragEnter', 'dragOver', 'drop']) await main.webContents.debugger.sendCommand('Input.dispatchDragEvent', { type, ...points.to, data: dragData });
            await main.webContents.debugger.sendCommand('Input.dispatchMouseEvent', { type: 'mouseReleased', ...points.to, button: 'left', buttons: 0, clickCount: 1 });
          } finally {
            main.webContents.debugger.off('message', intercept);
            await main.webContents.debugger.sendCommand('Input.setInterceptDrags', { enabled: false });
          }
          await pause(600);
        };
        await dragFolder('ui-one', 'ui-two');
        const after = await order();
        if (after.join('|') !== 'ui-two|ui-one') throw new Error('Folder drop did not reorder the list');
        const saved = JSON.parse(JSON.parse(fs.readFileSync(path.join(dataRoot, 'localLibrary.json'), 'utf8')).localBookmarks).categories.map(item => item.id);
        if (saved.join('|') !== after.join('|')) throw new Error('Folder drag order was not persisted');
        await dragFolder('ui-one', 'ui-two');
        const restored = await order();
        if (restored.join('|') !== before.join('|')) throw new Error('Reverse folder drop did not restore the order');
        console.log('UI_FOLDER_DRAG '+JSON.stringify({before,after,saved,restored,tv:process.env.LUMEN_SMOKE_TV==='1'}));
        return;
      }
      if (process.env.LUMEN_SMOKE_ATV_REVIEW === '1') {
        const previousFocus = await evaluate('window.lumenDiagnostics.currentFocus()');
        const geometry = () => evaluate(`JSON.stringify({width:document.getElementById('atv-navigation-sidebar').getBoundingClientRect().width,x:[...document.querySelectorAll('[data-lumen-pager]')].find(e=>e.getBoundingClientRect().width>0)?.getBoundingClientRect().x})`);
        const before = JSON.parse(await geometry());
        await evaluate('window.lumenDiagnostics.focusSidebar()'); await pause(700);
        const opened = JSON.parse(await geometry());
        if (opened.width <= before.width || Math.abs(opened.x - opened.width) > 1) throw new Error('ATV sidebar focus/geometry regression');
        await evaluate('window.lumenDiagnostics.focus(' + JSON.stringify(previousFocus) + ')'); await pause(700);
        const closed = JSON.parse(await geometry());
        if (closed.width !== before.width) throw new Error('ATV sidebar did not close after focus left');
        await evaluate('window.lumenDiagnostics.settings()'); await pause(1000);
        const clickText = async text => {
          await evaluate(`(()=>{const e=[...document.querySelectorAll('*')].find(e=>e.childElementCount===0&&e.textContent===${JSON.stringify(text)});if(e)e.scrollIntoView({block:'center'});})()`);
          await pause(500);
          const point = await evaluate(`(()=>{const e=[...document.querySelectorAll('*')].find(e=>e.childElementCount===0&&e.textContent===${JSON.stringify(text)});if(!e)throw new Error('Missing setting');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()`);
          main.webContents.sendInputEvent({type:'mouseDown',...point,button:'left',clickCount:1});
          main.webContents.sendInputEvent({type:'mouseUp',...point,button:'left',clickCount:1});
        };
        await clickText('Порядок вкладок на ТВ'); await pause(700);
        const modalFocus = await evaluate('window.lumenDiagnostics.currentFocus()');
        if (modalFocus !== 'settings-order-close') throw new Error('ATV ordering modal did not claim close focus');
        fs.writeFileSync(path.join(__dirname,'ui-atv-order-modal-proof.png'),(await main.webContents.capturePage()).toPNG());
        main.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});main.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await pause(700);
        const restoredFocus = await evaluate('window.lumenDiagnostics.currentFocus()');
        if (!restoredFocus || restoredFocus === modalFocus) throw new Error('ATV ordering modal did not restore focus');
        console.log('UI_ATV_REVIEW '+JSON.stringify({before,opened,closed,previousFocus,modalFocus,restoredFocus}));
        fs.writeFileSync(path.join(__dirname,'ui-atv-settings-focus-proof.png'),(await main.webContents.capturePage()).toPNG());
        if (process.env.LUMEN_SMOKE_ATV_AUDIT === '1') {
          const key = async code => {
            main.webContents.sendInputEvent({ type: 'keyDown', keyCode: code });
            main.webContents.sendInputEvent({ type: 'keyUp', keyCode: code });
            await pause(300);
          };
          const restoredInfo = await evaluate('window.lumenDiagnostics.focusInfo()');
          if (!restoredInfo.text?.includes('Порядок вкладок на ТВ')) throw new Error('ATV modal closed the screen instead of restoring its trigger');
          await clickText('Источники контента'); await pause(800);
          const sourceEntry = await evaluate('window.lumenDiagnostics.focusInfo()');
          await key('Down');
          const sourceDown = await evaluate('window.lumenDiagnostics.focusInfo()');
          await key('Up');
          const sourceUp = await evaluate('window.lumenDiagnostics.focusInfo()');
          console.log('UI_ATV_SOURCES '+JSON.stringify({sourceEntry,sourceDown,sourceUp}));
          if (sourceDown.key === sourceUp.key) throw new Error('ATV source list cannot navigate');
          await key('Escape'); await pause(500);
          await clickText('Тема приложения'); await pause(800);
          const themeEntry = await evaluate('window.lumenDiagnostics.focusInfo()');
          if (!themeEntry.text?.includes('Как в системе')) throw new Error('ATV theme dropdown did not open');
          await key('Down');
          const themeDown = await evaluate('window.lumenDiagnostics.focusInfo()');
          if (themeDown.key === themeEntry.key) throw new Error('ATV theme dropdown cannot navigate');
          await key('Escape'); await pause(500);
          await evaluate("window.lumenDiagnostics.tab('Bookmarks-tab')"); await pause(700);
          const managerOpened = await evaluate(`(()=>{const icon=[...document.querySelectorAll('svg circle[cx="18"][cy="18"][r="3"]')].map(e=>e.closest('svg')).find(e=>e.getBoundingClientRect().width>0);if(!icon)return false;icon.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true;})()`);
          if (!managerOpened) throw new Error('ATV folder manager missing');
          await pause(600);
          const managerEntry = await evaluate('window.lumenDiagnostics.focusInfo()');
          if (managerEntry.width < 120) throw new Error('ATV new category label is clipped');
          await key('Up');
          const managerUp = await evaluate('window.lumenDiagnostics.focusInfo()');
          if (managerEntry.key === managerUp.key) throw new Error('ATV folder manager cannot navigate');
          await key('Escape'); await pause(500);
          await evaluate("window.lumenDiagnostics.tab('Recent-tab')"); await pause(800);
          const recent = await evaluate('window.lumenDiagnostics.focusInfo()');
          await key('Right');
          const recentRight = await evaluate('window.lumenDiagnostics.focusInfo()');
          if (recentRight.key === recent.key) throw new Error('ATV Recent focus did not move');
          console.log('UI_ATV_AUDIT '+JSON.stringify({themeEntry,themeDown,managerEntry,managerUp,recent,recentRight}));
          fs.writeFileSync(path.join(__dirname,'ui-atv-audit-proof.png'),(await main.webContents.capturePage()).toPNG());
        }
        return;
      }
      await swipe();
      console.log('UI_HOME_SWIPE ' + await evaluate("JSON.stringify([...document.querySelectorAll('[data-lumen-pager]')].map(e=>e.dataset.lumenPage))"));
      await evaluate("window.lumenDiagnostics.tab('Bookmarks-tab')"); await pause(700); await swipe();
      console.log('UI_BOOKMARK_SWIPE ' + await evaluate("JSON.stringify([...document.querySelectorAll('[data-lumen-pager]')].map(e=>e.dataset.lumenPage))"));
      const manager = await evaluate(`(()=>{const icon=[...document.querySelectorAll('svg circle[cx="18"][cy="18"][r="3"]')].map(e=>e.closest('svg')).find(e=>e.getBoundingClientRect().width>0);if(!icon)return null;const r=icon.getBoundingClientRect();icon.dispatchEvent(new MouseEvent('click',{bubbles:true}));return {width:r.width,height:r.height};})()`);
      await pause(350);
      const deletion = await evaluate(`JSON.stringify([...document.querySelectorAll('svg path[d="M3 6h18"]')].map(e=>{const r=e.closest('svg').getBoundingClientRect();return {width:r.width,height:r.height};}))`);
      console.log('UI_FOLDER_ICONS '+JSON.stringify({manager,deletion}));
      if (!manager || manager.width<27 || (JSON.parse(deletion).length<2 || JSON.parse(deletion).some(r=>r.width<23 || r.height<23))) throw new Error('Folder icon geometry regression');
      fs.writeFileSync(path.join(__dirname,'ui-folders-proof.png'),(await main.webContents.capturePage()).toPNG());
      main.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});main.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await pause(250);
      await evaluate("window.lumenDiagnostics.tab('Recent-tab')"); await pause(1200);
      console.log('UI_RECENT_LAYOUT ' + await evaluate("JSON.stringify({images:[...document.querySelectorAll('img')].filter(e=>e.src.startsWith('data:image/png;base64')).map(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width,complete:e.complete})),text:document.body.innerText.slice(-500)})"));
      fs.writeFileSync(path.join(__dirname, 'ui-recent-proof.png'), (await main.webContents.capturePage()).toPNG());
      await swipe();
      console.log('UI_RECENT_SWIPE ' + await evaluate("JSON.stringify([...document.querySelectorAll('[data-lumen-pager]')].map(e=>({page:e.dataset.lumenPage,text:e.parentElement.innerText.slice(0,100)})))"));
      const savedHistory = JSON.parse(JSON.parse(fs.readFileSync(path.join(dataRoot, 'localLibrary.json'), 'utf8')).localHistory);
      const fixtureCard = savedHistory[0].filmCard;
      const sectionFilm = { ...fixtureCard, id: 'ui-native-sections', link: 'https://w1.zona.im/movies/ui-native-sections', title: 'Нативные разделы Zona', voices: [], hasSeasons: false, hasVoices: false, ratings: [],
        franchise: [{ name: 'Поздняя часть', year: '2020', rating: '8', link: '/part2' }, { name: 'Ранняя часть', year: '2001', rating: '7', link: '/part1' }],
        related: savedHistory.slice(0, 3).map(item => item.filmCard) };
      await evaluate('window.lumenDiagnostics.previewFilm(' + JSON.stringify(sectionFilm) + ')'); await pause(700);
      console.log('UI_NATIVE_SECTIONS ' + await evaluate("JSON.stringify({rows:[...document.querySelectorAll('[data-lumen-selectable]')].filter(e=>e.textContent==='Ранняя часть'||e.textContent==='Поздняя часть').map(e=>({name:e.textContent,width:e.parentElement.getBoundingClientRect().width,height:e.parentElement.getBoundingClientRect().height})),related:(()=>{const h=[...document.querySelectorAll('[data-lumen-selectable]')].find(e=>e.textContent==='Смотреть также');return h?[...h.parentElement.querySelectorAll('img')].map(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width,complete:e.complete})):[]})()})"));
      fs.writeFileSync(path.join(__dirname, 'ui-sections-proof.png'), (await main.webContents.capturePage()).toPNG());
      const bookmarkOpened = await evaluate(`(()=>{const icon=[...document.querySelectorAll('svg path')].find(e=>e.getAttribute('d')?.startsWith('M17 3a2')&&e.getBoundingClientRect().width>0);if(!icon)return false;icon.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true;})()`);
      await pause(400);
      const bookmarkPanel = await evaluate(`(()=>{const panel=document.getElementById('lumen-bookmarks-panel');if(!panel)return null;const r=panel.getBoundingClientRect();return {width:r.width,height:r.height,viewport:innerHeight,text:panel.innerText,opacity:(()=>{const values=[];for(let e=panel;e;e=e.parentElement)values.push(getComputedStyle(e).opacity);return values;})()};})()`);
      if (!bookmarkOpened || !bookmarkPanel || bookmarkPanel.width>600 || bookmarkPanel.height>bookmarkPanel.viewport-50 || !bookmarkPanel.text.includes('Новая категория')) throw new Error('Desktop bookmark panel layout regression');
      console.log('UI_BOOKMARK_PANEL '+JSON.stringify(bookmarkPanel));
      main.webContents.invalidate(); await pause(500);
      fs.writeFileSync(path.join(__dirname,'ui-bookmark-panel-proof.png'),(await main.webContents.capturePage()).toPNG());
      if (process.env.LUMEN_SMOKE_BOOKMARKS_ONLY === '1') return;
      main.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});main.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await pause(300);
      main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Escape' }); main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Escape' }); await pause(300);
      const records = JSON.parse(JSON.parse(fs.readFileSync(path.join(__dirname, 'smoke-data-offline/downloads.json'), 'utf8')).taskIds);
      const item = Object.values(records).find(item => fs.existsSync(item.destination));
      if (!item) throw new Error('Local diagnostic episode is missing');
      const fixture = path.join(dataRoot, 'downloads/ui-episode.mp4');
      fs.mkdirSync(path.dirname(fixture), { recursive: true });
      fs.copyFileSync(item.destination, fixture);
      if (fs.existsSync(item.destination + '.parts')) fs.cpSync(item.destination + '.parts', fixture + '.parts', { recursive: true });
      // The HLS fixture references its original basename.
      const manifest = fs.readFileSync(fixture, 'utf8');
      if (manifest.startsWith('#EXTM3U')) fs.writeFileSync(fixture, manifest.replaceAll(path.basename(item.destination) + '.parts/', 'ui-episode.mp4.parts/'));
      item.destination = fixture;
      const voice = item.film.voices[0];
      await evaluate('window.lumenDiagnostics.local(' + JSON.stringify({ film: item.film, voice, video: { streams: [{ url: item.destination, quality: item.quality }] }, isOffline: true }) + ')');
      await pause(3500);
      console.log('UI_PLAYER_INITIAL ' + await evaluate("JSON.stringify({ready:document.querySelector('video').readyState,paused:document.querySelector('video').paused})"));
      const surface = await evaluate("(()=>{const r=document.querySelector('#lumen-player').getBoundingClientRect();return {x:Math.round(r.x+r.width*.5),y:Math.round(r.y+r.height*.32)}})()");
      const hiddenControls = await evaluate("(()=>{let e=document.querySelector('#lumen-player svg rect[x=\"5\"][width=\"5\"]');for(;e&&e.id!=='lumen-player';e=e.parentElement){if(Number(getComputedStyle(e).opacity)<.1)return true}return false})()");
      if (hiddenControls) {
        main.webContents.sendInputEvent({ type: 'mouseDown', ...surface, button: 'left', clickCount: 1 });
        main.webContents.sendInputEvent({ type: 'mouseUp', ...surface, button: 'left', clickCount: 1 }); await pause(300);
      }
      const playPoint = await evaluate("(()=>{const icon=document.querySelector('#lumen-player svg rect[x=\"5\"][width=\"5\"]'); const e=icon?.closest('svg'); if(!e)return null; const r=e.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()");
      if (playPoint) {
        fs.writeFileSync(path.join(__dirname, 'ui-player-before.png'), (await main.webContents.capturePage()).toPNG());
        const states = [];
        for (let index = 0; index < 6; index++) {
          main.webContents.sendInputEvent({ type: 'mouseDown', ...playPoint, button: 'left', clickCount: 1 });
          main.webContents.sendInputEvent({ type: 'mouseUp', ...playPoint, button: 'left', clickCount: 1 });
          await pause(150);
          states.push(await evaluate("document.querySelector('video').paused"));
        }
        console.log('UI_PAUSE_CLICKS ' + JSON.stringify(states));
        if (!states.every((state, index) => state === (index % 2 === 0))) throw new Error('Player pause clicks were not handled exactly once');
      } else console.log('UI_PAUSE_MISSING');
      await evaluate("window.lumenDiagnostics.originalVideo=document.querySelector('video');document.querySelector('video').lumenMini.enter()"); await pause(400);
      console.log('UI_MINI_ICONS ' + await evaluate("JSON.stringify({buttons:document.querySelectorAll('#lumen-mini-playback button').length,svg:document.querySelectorAll('#lumen-mini-playback svg').length,expand:!!document.querySelector('#lumen-mini-controls button svg')})"));
      fs.writeFileSync(path.join(__dirname, 'ui-mini-proof.png'), (await main.webContents.capturePage()).toPNG());
      console.log('UI_MINI_ENTER ' + JSON.stringify({ bounds: main.getBounds(), mini: await evaluate("document.body.classList.contains('lumen-mini')"), time: await evaluate("document.querySelector('video').currentTime") }));
      const behavior = await evaluate(`(async()=>{
        const video=document.querySelector('video'), buttons=document.querySelector('#lumen-mini-playback');
        await video.play();
        document.documentElement.dispatchEvent(new MouseEvent('mouseleave'));
        const hidden=getComputedStyle(buttons).visibility==='hidden';
        document.dispatchEvent(new MouseEvent('mousemove',{clientX:100,clientY:100}));
        const shown=getComputedStyle(buttons).visibility==='visible';
        await new Promise(resolve=>setTimeout(resolve,3100));
        const idle=getComputedStyle(video).cursor==='none';
        document.dispatchEvent(new MouseEvent('mousemove',{clientX:101,clientY:100}));
        const restored=getComputedStyle(video).cursor!=='none';
        video.pause(); await new Promise(resolve=>setTimeout(resolve,100));
        document.documentElement.dispatchEvent(new MouseEvent('mouseleave'));
        const paused=getComputedStyle(buttons).visibility==='visible';
        return {hidden,shown,idle,restored,paused};
      })()`);
      console.log('UI_MINI_BEHAVIOR ' + JSON.stringify({ ...behavior, alwaysOnTop: main.isAlwaysOnTop() }));
      if (!Object.values(behavior).every(Boolean) || !main.isAlwaysOnTop()) throw new Error('Mini-player visibility or cursor regression');
      main.setPosition(120, 100); await pause(300);
      await evaluate("document.querySelector('#lumen-mini-controls button:last-child').click()"); await pause(400);
      console.log('UI_MINI_RESTORE ' + JSON.stringify({ bounds: main.getBounds(), mini: await evaluate("document.body.classList.contains('lumen-mini')"), video: await evaluate("JSON.stringify({same:document.querySelector('video')===window.lumenDiagnostics.originalVideo,width:document.querySelector('video').getBoundingClientRect().width,height:document.querySelector('video').getBoundingClientRect().height,ready:document.querySelector('video').readyState})") }));
      await evaluate("document.querySelector('video').lumenMini.enter()"); await pause(400);
      console.log('UI_MINI_REMEMBER ' + JSON.stringify(main.getBounds()));
      main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Escape' }); main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Escape' }); await pause(500);
      console.log('UI_MINI_ESCAPE ' + await evaluate("!document.body.classList.contains('lumen-mini')"));
      main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Escape' }); main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Escape' }); await pause(600);
      console.log('UI_BACK ' + await evaluate("!document.querySelector('#lumen-player')"));
      await evaluate("window.lumenDiagnostics.settings()");await pause(500);
      await evaluate(`(()=>{const e=[...document.querySelectorAll('*')].find(e=>!e.children.length&&e.textContent==='Интерфейс');e?.click();})()`);await pause(400);
      await evaluate(`(()=>{const e=[...document.querySelectorAll('*')].find(e=>!e.children.length&&e.textContent==='Стартовая вкладка главной');e?.click();})()`);await pause(400);
      const ordering = await evaluate(`(()=>{const actions=[...document.querySelectorAll('svg')].filter(e=>{let p=e.parentElement;while(p&&p!==document.body){if(Math.abs(p.getBoundingClientRect().width-40)<1)return true;p=p.parentElement;}return false;}).filter(e=>e.getBoundingClientRect().width>0).map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};});const label=[...document.querySelectorAll('*')].reverse().find(e=>e.textContent==='Новинки');let row=label?.parentElement;while(row&&!row.querySelector('svg'))row=row.parentElement;const icon=row?.querySelector('svg');return {actions,gap:label&&icon?label.getBoundingClientRect().left-icon.getBoundingClientRect().right:null};})()`);
      console.log('UI_ORDER_ICONS '+JSON.stringify(ordering));
      if (ordering.actions.length < 33 || ordering.actions.some(r=>r.width<23 || r.height<23) || ordering.gap<11) throw new Error('Navigation editor icon or spacing regression');
      fs.writeFileSync(path.join(__dirname,'ui-settings-order-proof.png'),(await main.webContents.capturePage()).toPNG());
    };
    setTimeout(() => run().catch(error => console.log('UI_ERROR ' + error.stack)), 7000);
  }
  if (process.env.LUMEN_SMOKE_MODE === 'downloads') setTimeout(() => main.webContents.executeJavaScript("window.lumenDiagnostics.showDownloads()"), 4000);
  if (process.env.LUMEN_SMOKE_MODE === 'anime') {
    setTimeout(() => { main.focus(); main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Space' }); main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Space' }); }, 18000);
    setTimeout(async () => console.log('KEYBOARD_PAUSE ' + await main.webContents.executeJavaScript("document.querySelector('video')?.paused")), 19000);
    setTimeout(() => { main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Space' }); main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Space' }); }, 21000);
    setTimeout(async () => console.log('KEYBOARD_RESUME ' + !(await main.webContents.executeJavaScript("document.querySelector('video')?.paused"))), 22000);
  }
  if (process.env.LUMEN_SMOKE_MODE === 'offline') setTimeout(async () => {
    console.log('DOWNLOADS_UI ' + JSON.stringify(await main.webContents.executeJavaScript('document.body.innerText.slice(-1200)')));
    await main.webContents.executeJavaScript('window.lumenDiagnostics.playLocal()');
  }, 50000);
  if (process.env.LUMEN_SMOKE_MODE === 'offline') setTimeout(async () => {
    try { console.log('OFFLINE_PROBE ' + JSON.stringify(await main.webContents.executeJavaScript('window.lumenDiagnostics.offline()'))); }
    catch (error) { console.log('OFFLINE_PROBE_ERROR ' + error.message); }
  }, 4000);
  if (process.env.LUMEN_SMOKE_MODE === 'updates') setTimeout(async () => {
    try { console.log('UPDATES_PROBE ' + JSON.stringify(await main.webContents.executeJavaScript('window.lumenDiagnostics.updates()'))); }
    catch (error) { console.log('UPDATES_PROBE_ERROR ' + error.message); }
  }, 4000);
  if (process.env.LUMEN_SMOKE_MODE === 'rezka') setTimeout(async () => {
    try { console.log('REZKA_PROBE ' + JSON.stringify(await main.webContents.executeJavaScript('window.lumenDiagnostics.rezka()'))); }
    catch (error) { console.log('REZKA_PROBE_ERROR ' + error.message); }
  }, 4000);
  if (process.env.LUMEN_SMOKE_MODE === 'anime') setTimeout(async () => {
    try { console.log('ANIME_PROBE ' + JSON.stringify(await main.webContents.executeJavaScript('window.lumenDiagnostics.anime()'))); }
    catch (error) { console.log('ANIME_PROBE_ERROR ' + error.message); }
  }, 4000);
  if (process.env.LUMEN_SMOKE_MODE === 'home') {
    setTimeout(() => main.webContents.executeJavaScript("document.querySelector('#lumen-titlebar button').click()"), 7000);
    setTimeout(async () => {
      await main.webContents.executeJavaScript("document.dispatchEvent(new MouseEvent('mousemove',{clientY:1}))");
      console.log('FULLSCREEN_ENTER ' + JSON.stringify({ fullscreen: main.isFullScreen(), revealed: await main.webContents.executeJavaScript("document.body.classList.contains('titlebar-visible')") }));
      main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'F11' }); main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'F11' });
    }, 9000);
    setTimeout(() => console.log('FULLSCREEN_EXIT ' + !main.isFullScreen()), 11000);
  }
  if (process.env.LUMEN_SMOKE_TV === '1') {
    setTimeout(async () => {
      const focused = () => { const e = document.querySelector('[data-focused="true"]'); return e ? { text: e.innerText.slice(0, 80), x: e.getBoundingClientRect().x } : null; };
      console.log('ATV_FOCUS_BEFORE ' + JSON.stringify(await main.webContents.executeJavaScript('(' + focused.toString() + ')()')));
      main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Right' });
      main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Right' });
      setTimeout(async () => console.log('ATV_FOCUS_AFTER ' + JSON.stringify(await main.webContents.executeJavaScript('(' + focused.toString() + ')()'))), 500);
    }, 6000);
  }
  if (process.env.LUMEN_SMOKE_MODE === 'sources') setTimeout(async () => {
    console.log('SOURCE_PROBE ' + JSON.stringify(await main.webContents.executeJavaScript("window.lumenDiagnostics.sources('Мстители: Финал')")));
  }, 7000);
  if (['film','desktop-info'].includes(process.env.LUMEN_SMOKE_MODE)) setTimeout(async () => {
    const point = await main.webContents.executeJavaScript("(()=>{const el=[...document.querySelectorAll('*')].find(el=>el.childElementCount===0&&el.textContent==='Мстители: Финал'); if(!el)return null;const box=el.getBoundingClientRect();return {x:Math.round(box.x+box.width/2),y:Math.round(box.y-80)};})()");
    console.log('FILM_CLICK ' + JSON.stringify(point));
    if (point) {
      main.webContents.sendInputEvent({ type: 'mouseMove', ...point });
      main.webContents.sendInputEvent({ type: 'mouseDown', ...point, button: 'left', clickCount: 1 });
      await new Promise(resolve => setTimeout(resolve, 120));
      main.webContents.sendInputEvent({ type: 'mouseUp', ...point, button: 'left', clickCount: 1 });
    }
  }, 7000);
  if (process.env.LUMEN_SMOKE_MODE === 'film') setTimeout(async () => {
    const point = await main.webContents.executeJavaScript("(()=>{const el=[...document.querySelectorAll('*')].find(el=>el.childElementCount===0&&el.textContent==='Смотреть'); if(!el)return null;el.scrollIntoView({block:'center'});const box=el.getBoundingClientRect();return {x:Math.round(box.x+box.width/2),y:Math.round(box.y+box.height/2)};})()");
    console.log('WATCH_CLICK ' + JSON.stringify(point));
    if (point) {
      main.webContents.sendInputEvent({ type: 'mouseMove', ...point });
      main.webContents.sendInputEvent({ type: 'mouseDown', ...point, button: 'left', clickCount: 1 });
      await new Promise(resolve => setTimeout(resolve, 120));
      main.webContents.sendInputEvent({ type: 'mouseUp', ...point, button: 'left', clickCount: 1 });
    }
  }, 25000);
  if (process.env.LUMEN_SMOKE_MODE === 'film') setTimeout(async () => {
    const point = await main.webContents.executeJavaScript("(()=>{const el=[...document.querySelectorAll('*')].find(el=>el.childElementCount===0&&el.textContent.includes('Дублированный (Zona)')); if(!el)return null;const box=el.getBoundingClientRect();return {x:Math.round(box.x+box.width/2),y:Math.round(box.y+box.height/2)};})()");
    console.log('VOICE_CLICK ' + JSON.stringify(point));
    if (point) {
      main.webContents.sendInputEvent({ type: 'mouseMove', ...point });
      main.webContents.sendInputEvent({ type: 'mouseDown', ...point, button: 'left', clickCount: 1 });
      await new Promise(resolve => setTimeout(resolve, 120));
      main.webContents.sendInputEvent({ type: 'mouseUp', ...point, button: 'left', clickCount: 1 });
    }
  }, 37000);
  if (process.env.LUMEN_SMOKE_MODE === 'desktop-info') {
    setTimeout(async () => {
      console.log('UI_DETAILS_SELECT ' + await main.webContents.executeJavaScript("JSON.stringify({details:document.body.classList.contains('lumen-details'),selection:getComputedStyle(document.querySelector('[data-lumen-selectable]')).userSelect})"));
      main.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Escape' }); main.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Escape' });
      setTimeout(async () => console.log('UI_DETAILS_BACK ' + await main.webContents.executeJavaScript("!document.body.classList.contains('lumen-details')")), 400);
    }, 24000);
    setTimeout(async () => {
      console.log('DRAG_BEFORE ' + await main.webContents.executeJavaScript("JSON.stringify([...document.querySelectorAll('div')].filter(e=>['auto','scroll'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+50).map(e=>e.scrollTop))"));
      main.webContents.sendInputEvent({ type: 'mouseDown', x: 1250, y: 650, button: 'left', clickCount: 1 });
      main.webContents.sendInputEvent({ type: 'mouseMove', x: 1250, y: 400, button: 'left' });
      main.webContents.sendInputEvent({ type: 'mouseUp', x: 1250, y: 400, button: 'left', clickCount: 1 });
      console.log('DRAG_AFTER ' + await main.webContents.executeJavaScript("JSON.stringify([...document.querySelectorAll('div')].filter(e=>['auto','scroll'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+50).map(e=>e.scrollTop))"));
    }, 23500);
    const scrollers = () => [...document.querySelectorAll('div')].filter(e => ['auto','scroll'].includes(getComputedStyle(e).overflowY) && e.clientHeight > 100 && e.scrollHeight > e.clientHeight + 50).map(e => ({ height: e.clientHeight, content: e.scrollHeight, top: e.scrollTop, x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y }));
    setTimeout(async () => {
      console.log('WHEEL_BEFORE ' + JSON.stringify(await main.webContents.executeJavaScript('(' + scrollers.toString() + ')()')));
      main.webContents.sendInputEvent({ type: 'mouseMove', x: 900, y: 650 });
      main.webContents.sendInputEvent({ type: 'mouseWheel', x: 900, y: 650, deltaY: -600, deltaX: 0 });
    }, 21000);
    setTimeout(async () => console.log('WHEEL_AFTER ' + JSON.stringify(await main.webContents.executeJavaScript('(' + scrollers.toString() + ')()'))), 23000);
  }
  if (process.env.LUMEN_SMOKE_MODE === 'desktop-google') {
    setTimeout(() => main.webContents.executeJavaScript('window.lumenDiagnostics.settings()'), 4000);
    const clickText = async text => {
      const point = await main.webContents.executeJavaScript('('+ ((text) => {
        const el = [...document.querySelectorAll('*')].find(el => el.childElementCount === 0 && el.textContent === text);
        if (!el) return null;
        el.scrollIntoView({ block: 'center' }); const box = el.getBoundingClientRect();
        return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
      }).toString() + ')(' + JSON.stringify(text) + ')');
      if (!point) { console.log('MISSING_CLICK ' + text); return; }
      main.webContents.sendInputEvent({ type: 'mouseMove', ...point });
      main.webContents.sendInputEvent({ type: 'mouseDown', ...point, button: 'left', clickCount: 1 });
      main.webContents.sendInputEvent({ type: 'mouseUp', ...point, button: 'left', clickCount: 1 });
      console.log('SETTINGS_CLICK ' + text);
    };
    setTimeout(() => clickText('Сетевые настройки'), 6000);
    setTimeout(() => clickText('Синхронизация с Google Drive'), 8000);
  }
  if (process.env.LUMEN_SMOKE_TEST) setTimeout(async () => {
    const snapshot = () => ({ title: document.title, text: document.body.innerText.slice(-1600), video: (() => { const v = document.querySelector('video'); return v ? { time: v.currentTime, duration: v.duration, ready: v.readyState, error: v.error?.code, width: v.videoWidth, paused: v.paused } : null; })() });
    const result = { ...await main.webContents.executeJavaScript('(' + snapshot.toString() + ')()'), dataRoot, portableRoot };
    console.log('WINDOWS_SMOKE ' + JSON.stringify(result));
    if (process.env.LUMEN_SMOKE_OUTPUT) {
      fs.writeFileSync(process.env.LUMEN_SMOKE_OUTPUT, JSON.stringify(result));
      fs.writeFileSync(process.env.LUMEN_SMOKE_OUTPUT.replace(/\.json$/, '.png'), (await main.webContents.capturePage()).toPNG());
    }
    fs.writeFileSync(path.join(__dirname, 'smoke.png'), (await main.webContents.capturePage()).toPNG()); app.exit(0);
  }, process.env.LUMEN_SMOKE_DETAIL_DRAG === '1' ? 25000 : process.env.LUMEN_SMOKE_FOLDER_DRAG === '1' ? 30000 : process.env.LUMEN_SMOKE_ATV_AUDIT === '1' ? 35000 : process.env.LUMEN_SMOKE_BOOKMARKS_ONLY === '1' ? 15000 : process.env.LUMEN_SMOKE_MODE === 'desktop-ui' ? 42000 : process.env.LUMEN_SMOKE_MODE === 'desktop-info' ? 26000 : ['film','sources'].includes(process.env.LUMEN_SMOKE_MODE) ? 55000 : ['anime','rezka','updates'].includes(process.env.LUMEN_SMOKE_MODE) ? 35000 : process.env.LUMEN_SMOKE_MODE === 'offline' ? 80000 : 15000);
});
app.on('before-quit', () => { for (const child of children.values()) if (!child.isDestroyed()) child.destroy(); });
app.on('window-all-closed', () => app.quit());
