import { createDesktopRequest, desktopRequestHeaders, preserveResponseCookies } from './request';
import { AppState, TextInput } from 'react-native';
import { installDesktopPointer } from './pointer';
installDesktopPointer(document);
TextInput.State.currentlyFocusedInput = () => document.activeElement?.matches('input,textarea,[contenteditable=true]') ? document.activeElement : null;
const originalStateListener = AppState.addEventListener.bind(AppState);
AppState.addEventListener = (event, listener) => {
  if (event !== 'focus' && event !== 'blur') return originalStateListener(event, listener);
  window.addEventListener(event, listener);
  return { remove: () => window.removeEventListener(event, listener) };
};
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const request = createDesktopRequest(input, init);
  if (!/^https?:/.test(request.url)) return originalFetch(input, init);
  if (request.signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const requestId = crypto.randomUUID(), abort = () => { void window.lumen.abortFetch(requestId).catch(() => {}); };
  request.signal.addEventListener('abort', abort, { once: true });
  try {
    const body = ['GET','HEAD'].includes(request.method) ? undefined : await request.text();
    if (request.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const result = await window.lumen.fetch({ requestId, url: request.url, method: request.method, headers: desktopRequestHeaders(request, init), body, redirect: request.redirect, credentials: request.credentials });
    if (request.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const bytes = Uint8Array.from(atob(result.body), char => char.charCodeAt(0));
    return preserveResponseCookies(new Response([204,205,304].includes(result.status) ? null : bytes, { status: result.status, statusText: result.statusText, headers: result.headers }), result.headers);
  } catch (error) { if (request.signal.aborted) throw new DOMException('Aborted', 'AbortError'); throw error; }
  finally { request.signal.removeEventListener('abort', abort); }
};
const css = document.createElement('style');
css.textContent = 'html,body,#root{height:100%;margin:0;background:#000;color:#fff}body{padding-top:36px;box-sizing:border-box}#lumen-titlebar{position:fixed;top:0;left:0;right:0;height:36px;background:#000;display:flex;align-items:center;z-index:2147483647;-webkit-app-region:drag;user-select:none;font:13px Segoe UI}#lumen-titlebar span{padding-left:16px;flex:1}#lumen-titlebar button{-webkit-app-region:no-drag;border:0;background:transparent;color:#eee;width:46px;height:36px;font:17px Segoe UI;cursor:pointer}#lumen-titlebar button:hover{background:#252525}#lumen-titlebar button:last-child:hover{background:#c42b1c}body.lumen-fullscreen{padding-top:0}body.lumen-fullscreen #lumen-titlebar{transform:translateY(-100%)}body.lumen-fullscreen.titlebar-visible #lumen-titlebar{transform:none}';
css.textContent += 'body{user-select:none;-webkit-user-select:none}input,textarea,[contenteditable=true]{user-select:text;-webkit-user-select:text}body.lumen-details [data-lumen-selectable]{user-select:text!important;-webkit-user-select:text!important}img{ -webkit-user-drag:none}*{scrollbar-color:#555 transparent}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#555;border-radius:8px}#lumen-player *{outline:none!important}body.lumen-mini{padding-top:0}body.lumen-mini #root{visibility:hidden}body.lumen-mini video{visibility:visible;position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483645;background:#000}body.lumen-mini #lumen-titlebar,body.lumen-mini #lumen-fullscreen-edge{display:none!important}#lumen-mini-controls{position:fixed;top:0;left:0;right:0;height:32px;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:0 8px;background:#0008;z-index:2147483646;-webkit-app-region:drag}#lumen-mini-controls button{-webkit-app-region:no-drag;color:white;background:#222b;border:0;border-radius:4px;width:32px;height:26px;cursor:pointer}';
css.textContent += 'body.lumen-mini #root *:has(video){transform:none!important;overflow:visible!important;contain:none!important}#lumen-mini-playback{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:12px;align-items:center;padding:10px 14px;border-radius:14px;background:#0008;z-index:2147483646}#lumen-mini-playback button{display:flex;align-items:center;justify-content:center;width:58px;height:58px;background:transparent;border:0;border-radius:50%;cursor:pointer}#lumen-mini-playback button:hover{background:#ffffff20}#lumen-mini-playback button:disabled{opacity:.35;cursor:default}#lumen-mini-controls button{display:flex;align-items:center;justify-content:center}';
css.textContent += 'body.lumen-mini:not(.lumen-video-hover):not(.lumen-video-paused) #lumen-mini-controls,body.lumen-mini:not(.lumen-video-hover):not(.lumen-video-paused) #lumen-mini-playback{visibility:hidden;pointer-events:none}body.lumen-video-idle #lumen-player,body.lumen-video-idle #lumen-player *,body.lumen-mini.lumen-video-idle,body.lumen-mini.lumen-video-idle *{cursor:none!important}';
document.head.appendChild(css);
const bar = document.createElement('div'); bar.id = 'lumen-titlebar';
bar.innerHTML = '<img src="lumen://app/lumen-icon.png" alt="Lumen" width="24" height="24" style="margin-left:12px;border-radius:6px;pointer-events:none"><span>Lumen</span>';
for (const [action, symbol, title] of [['fullscreen','⛶','Полный экран (F11)'],['minimize','—','Свернуть'],['maximize','□','Развернуть'],['close','×','Закрыть']]) {
  const button = document.createElement('button'); button.title = title; button.setAttribute('aria-label', title);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width','14'); svg.setAttribute('height','14'); svg.setAttribute('viewBox','0 0 16 16');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', ({ fullscreen: 'M2 6V2H6 M10 2H14V6 M14 10V14H10 M6 14H2V10', minimize: 'M2 11H14', maximize: 'M3 3H13V13H3Z', close: 'M3 3L13 13 M13 3L3 13' })[action]);
  path.setAttribute('stroke','currentColor'); path.setAttribute('fill','none'); path.setAttribute('stroke-width','1.2');
  svg.appendChild(path); button.appendChild(svg); button.onclick = () => window.lumen.action(action); bar.appendChild(button);
}
document.body.appendChild(bar);
const edge = document.createElement('div'); edge.id = 'lumen-fullscreen-edge';
edge.style.cssText = 'position:fixed;top:0;left:0;right:0;height:4px;z-index:2147483646;display:none';
edge.onmouseenter = () => document.body.classList.add('titlebar-visible');
bar.onmouseleave = event => { if (event.clientY > 36) document.body.classList.remove('titlebar-visible'); };
document.body.appendChild(edge);
window.lumen.onFullscreen(value => edge.style.display = value ? 'block' : 'none');
window.lumen.onFullscreen(value => { document.body.classList.remove('titlebar-visible'); document.body.classList.toggle('lumen-fullscreen', value); });
document.addEventListener('mousemove', event => {
  if (document.body.classList.contains('lumen-fullscreen')) document.body.classList.toggle('titlebar-visible', event.clientY <= 42);
});
document.addEventListener('keydown', event => {
  if (event.key === 'F11' || (event.key === 'Escape' && document.body.classList.contains('lumen-fullscreen'))) {
    event.preventDefault(); window.lumen.action('fullscreen');
  }
});
document.title = 'Lumen';




