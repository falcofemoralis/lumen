import { createPortal } from 'react-dom';
import { useEffect, useSyncExternalStore } from 'react';
import React from 'react';
import { View } from 'react-native';
export const KeyboardProvider = ({ children }) => children;
export const useKeyboardHandler = () => {};
export const useKeyboardState = () => ({ height: 0, isVisible: false });
export const KeyboardController = { setDefaultMode() {}, setInputMode() {}, dismiss() { document.activeElement?.blur(); } };
export const AndroidSoftInputModes = {};
export const VolumeManager = { getVolume: async () => ({ volume: 1 }), setVolume: async value => { document.querySelectorAll('video').forEach(video => video.volume = Math.max(0,Math.min(1,value))); }, addVolumeListener: () => ({ remove() {} }), showNativeVolumeUI() {} };
export const exitApp = () => window.lumen.action('close');
const listeners = new Map();
const codes = { ArrowLeft: 21, ArrowRight: 22, ArrowUp: 19, ArrowDown: 20, Enter: 23, Escape: 4, Backspace: 4, ' ': 62 };
const KeyEvent = {
  onKeyDownListener: fn => { document.removeEventListener('keydown', listeners.get('down')); const listener = e => { if (e.target?.matches('input,textarea,[contenteditable=true]')) return; if (e.key === ' ' && document.querySelector('video')) e.preventDefault(); fn({ keyCode: codes[e.key], pressedKey: e.key }); }; document.addEventListener('keydown', listener); listeners.set('down', listener); },
  onKeyUpListener: fn => { document.removeEventListener('keyup', listeners.get('up')); const listener = e => fn({ keyCode: codes[e.key], pressedKey: e.key }); document.addEventListener('keyup', listener); listeners.set('up', listener); },
  removeKeyDownListener: () => document.removeEventListener('keydown', listeners.get('down')),
  removeKeyUpListener: () => document.removeEventListener('keyup', listeners.get('up')),
  restart: () => location.reload(), Restart: () => location.reload()
};
export default KeyEvent;
export const TrueSheet = React.forwardRef((props, ref) => {
  const [visible, setVisible] = React.useState(false);
  const close = () => { props.onWillDismiss?.(); setVisible(false); props.onDismiss?.(); props.onDidDismiss?.(); };
  React.useImperativeHandle(ref, () => ({
    async present() { props.onWillPresent?.(); setVisible(true); props.onPresent?.(); props.onDidPresent?.(); },
    async dismiss() { close(); }, async resize() {}
  }));
  React.useEffect(() => {
    if (!visible) return;
    const escape = event => { if (event.key === 'Escape') { event.stopImmediatePropagation(); event.preventDefault(); close(); } };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, [visible]);
  if (!visible) return null;
  return createPortal(React.createElement('div', { role: 'dialog', 'aria-modal': true,
    onClick: event => { if (event.target === event.currentTarget) close(); },
    style: { position: 'fixed', inset: '36px 0 0', zIndex: 100000, background: '#000b', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  }, React.createElement(View, { style: { width: 'min(760px, 94vw)', maxHeight: '85vh', height: props.scrollable ? '85vh' : undefined, overflow: 'hidden', borderRadius: 20, backgroundColor: props.backgroundColor || '#171717' } },
  props.children)), document.body);
});
export const reactNativeWebCookies = {
  isSupported: true, getCookies: url => window.lumen.cookies(url),
  getDefaultUserAgent: async () => navigator.userAgent,
  removeCookies: (url, names) => window.lumen.removeCookies(url, names),
  clearCookies: () => window.lumen.clearCookies(), flush: () => window.lumen.flushCookies()
};
const notApplicable = {
  isSupported: () => false, isAvailable: false,
  addListener: () => ({ remove() {} }), addSearchRequestedListener: () => ({ remove() {} }),
  getInitialSearchQuery: () => null, setEnabled: async () => {},
  getChannels: async () => [], getStatus: async () => ({ isSupported: false, isEnabled: false }),
  setStyle() {}, setStrength() {}, reset() {}, restore: async () => {}, cancelBackgroundSync: async () => false
};
export const reactNativeAfr = notApplicable, reactNativeLoudness = notApplicable,
reactNativeTvChannels = notApplicable, reactNativeTvSearch = notApplicable,
reactNativeSubtitleStyle = {
  setStyle(style) {
    let element = document.getElementById('lumen-subtitle-style');
    if (!element) { element = document.createElement('style'); element.id = 'lumen-subtitle-style'; document.head.appendChild(element); }
    const color = value => /^#[0-9a-f]{8}$/i.test(value) ? '#' + value.slice(3) + value.slice(1,3) : value;
    element.textContent = 'video::cue{color:' + color(style.foregroundColor) + ';background:' + color(style.backgroundColor)
      + ';font-size:' + Math.max(12, Math.round(window.innerHeight * style.textSizeFraction)) + 'px;}';
  },
  reset() { document.getElementById('lumen-subtitle-style')?.remove(); }
}, reactNativeFocusScroll = notApplicable;
export const DEFAULT_TEXT_SIZE_FRACTION = 0.0533;
export const SubtitleEdgeType = { NONE: 'none', OUTLINE: 'outline', DROP_SHADOW: 'dropShadow' };
export const LoudnessStrength = { OFF: 'off', LIGHT: 'light', MEDIUM: 'medium', STRONG: 'strong' };
export const AfrOutcome = { IDLE: 'idle', SWITCHED: 'switched', ALREADY_MATCHED: 'alreadyMatched', SURFACE_REQUESTED: 'surfaceRequested', NO_MATCH: 'noMatch', MEASURING: 'measuring', NO_FRAME_RATE: 'noFrameRate', UNSUPPORTED: 'unsupported' };
export const reactNativeDownloads = {
  getDefaultDownloadDirectory: () => window.lumen.paths.downloads,
  getDownloadsDirectories: () => [{ rootPath: window.lumen.paths.data, downloadsPath: window.lumen.paths.downloads, isRemovable: false, isPrimary: true }],
  getDownloadDirectories: async () => [{ name: 'Lumen', path: window.lumen.paths.downloads }],
  openFolder: path => window.lumen.openFolder(path),
  deleteFile: path => window.lumen.file('delete', path),
  exists: path => window.lumen.file('exists', path),
  requestPermissions: async () => true,
  pickDirectory: async () => window.lumen.chooseDirectory()
};
export const ApkInstaller = { isSupported: false };




