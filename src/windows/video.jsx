import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import Hls from 'hls.js';
import * as dashjs from 'dashjs';
import { createPortal } from 'react-dom';
import Play from 'lucide-react-native/icons/play';
import Pause from 'lucide-react-native/icons/pause';
import SkipBack from 'lucide-react-native/icons/skip-back';
import SkipForward from 'lucide-react-native/icons/skip-forward';
import Maximize2 from 'lucide-react-native/icons/maximize-2';
export const ResizeMode = { CONTAIN: 'contain', COVER: 'cover', STRETCH: 'stretch', NONE: 'none' };
class DesktopVideoPlayer {
  constructor(source) { this.source = source; this.status = 'loading'; this.listeners = new Map(); this.rate = 1; this.loop = false; this.volume = 1; this.muted = false; }
  emit(name, value) { this.listeners.get(name)?.forEach(fn => fn(value)); }
  fail(message) { this.status = 'error'; this.emit('onStatusChange', this.status); this.emit('onError', { message }); }
  addEventListener(name, fn) { const set = this.listeners.get(name) || new Set(); set.add(fn); this.listeners.set(name, set); return { remove: () => set.delete(fn) }; }
  get rate() { return this.element?.playbackRate ?? this._rate ?? 1; } set rate(value) { this._rate = value; if (this.element) this.element.playbackRate = value; }
  get volume() { return this.element?.volume ?? this._volume ?? 1; } set volume(value) { this._volume = value; if (this.element) this.element.volume = Math.max(0, Math.min(1, value)); }
  get muted() { return this.element?.muted ?? this._muted ?? false; } set muted(value) { this._muted = value; if (this.element) this.element.muted = value; }
  get currentTime() { return this.element?.currentTime || 0; } set currentTime(time) { if (this.element?.readyState >= 1) this.element.currentTime = time; else this.pendingSeek = time; }
  get duration() { return this.element?.duration || 0; }
  get isPlaying() { return !!this.element && !this.element.paused; }
  play() { if (this.element) { this.element.playbackRate = this.rate; return this.element.play().catch(error => this.fail(error.message)); } }
  pause() { this.element?.pause(); }
  seekTo(time) { this.currentTime = time; }
  seekBy(time) { this.currentTime = Math.max(0, this.currentTime + time); }
  getAvailableTextTracks() { return Array.from(this.element?.textTracks || []).map((track, id) => ({ id, label: track.label })); }
  selectTextTrack(track) { Array.from(this.element?.textTracks || []).forEach((item, id) => item.mode = track?.id === id ? 'showing' : 'disabled'); this.selectedTrack = track; }
  async replaceSourceAsync(source) {
    const generation = this.generation = (this.generation || 0) + 1;
    this.source = source; if (!this.element) return;
    if (window.lumen.diagnostic) console.log('WINDOWS_VIDEO_SOURCE', JSON.stringify(source));
    this.hls?.destroy(); this.dash?.reset(); this.status = 'loading'; this.emit('onStatusChange', this.status);
    const input = /^file:/.test(source.uri) ? 'lumen-file://app/?path=' + encodeURIComponent(source.uri) : source.uri;
    const url = /^https?:/.test(input) ? await window.lumen.media(input, source.headers) : input;
    if (generation !== this.generation || !this.element) return;
    if (/\.mpd(?:[?#]|$)/i.test(source.uri) || (input.startsWith('lumen-file:') && window.lumen.file('dash', input))) {
      this.dash = dashjs.MediaPlayer().create();
      this.dash.addRequestInterceptor(async request => {
        if (/^https?:/.test(request.url)) request.url = await window.lumen.media(request.url, source.headers);
        return request;
      });
      this.dash.on(dashjs.MediaPlayer.events.ERROR, event => {
        if (window.lumen.diagnostic) console.log('WINDOWS_DASH_ERROR', String(event.error?.message || event.error?.code || event.type));
        this.fail(event.error?.message || 'DASH playback failed');
      });
      this.dash.initialize(this.element, url, false);
    } else if ((/\.m3u8(?:[?#]|$)/i.test(source.uri) || (input.startsWith('lumen-file:') && window.lumen.file('hls', input))) && Hls.isSupported()) {
      const BaseLoader = Hls.DefaultConfig.loader, headers = source.headers || {};
      class DesktopLoader extends BaseLoader {
        load(context, config, callbacks) {
          if (/^https?:/.test(context.url)) {
            window.lumen.media(context.url, headers).then(url => super.load({ ...context, url }, config, callbacks))
              .catch(error => callbacks.onError({ code: 0, text: error.message }, context, null));
          } else super.load(context, config, callbacks);
        }
      }
      this.hls = new Hls({ enableWorker: true, loader: DesktopLoader }); this.hls.attachMedia(this.element); this.hls.loadSource(url);
      this.hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) this.fail(data.details); });
    } else { this.element.src = url; this.element.load(); }
  }
  release() { this.generation = (this.generation || 0) + 1; this.hls?.destroy(); this.dash?.reset(); this.pause(); }
}
export const useVideoPlayer = source => { const player = useRef(); if (!player.current) player.current = new DesktopVideoPlayer(source); useEffect(() => () => player.current.release(), []); return player.current; };
export const useEvent = (player, event, callback) => { const latest = useRef(callback); latest.current = callback; useEffect(() => { const sub = player.addEventListener(event, value => latest.current(value)); return () => sub.remove(); }, [player, event]); };
export const VideoView = forwardRef(({ player, style, resizeMode, controls, episodeNavigation }, ref) => {
  const element = useRef(), miniActive = useRef(false), miniBusy = useRef(false);
  const [mini, setMini] = React.useState(false);
  const [paused, setPaused] = React.useState(!player.isPlaying);
  useEffect(() => {
    let timer;
    const body = document.body;
    const show = () => {
      body.classList.add('lumen-video-hover');
      body.classList.remove('lumen-video-idle');
      clearTimeout(timer);
      timer = setTimeout(() => body.classList.add('lumen-video-idle'), 3000);
    };
    const leave = () => { body.classList.remove('lumen-video-hover'); clearTimeout(timer); };
    document.addEventListener('mousemove', show);
    document.documentElement.addEventListener('mouseleave', leave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', show);
      document.documentElement.removeEventListener('mouseleave', leave);
      body.classList.remove('lumen-video-hover', 'lumen-video-idle', 'lumen-video-paused');
    };
  }, []);
  useEffect(() => { document.body.classList.toggle('lumen-video-paused', paused); }, [paused]);
  const settleLayout = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const restore = async () => {
    if (!miniActive.current || miniBusy.current) return;
    miniBusy.current = true;
    try {
      // Restore normal layout before growing the window; the same video element stays attached.
      document.body.classList.remove('lumen-mini');
      setMini(false);
      await window.lumen.action('mini-exit');
      miniActive.current = false;
      await settleLayout();
    } finally { miniBusy.current = false; }
  };
  const enterMini = async () => {
    if (miniActive.current || miniBusy.current) return;
    miniBusy.current = true;
    try {
      document.body.classList.add('lumen-mini');
      setMini(true);
      try { await window.lumen.action('mini-enter'); }
      catch (error) { document.body.classList.remove('lumen-mini'); setMini(false); throw error; }
      miniActive.current = true;
      await settleLayout();
    } finally { miniBusy.current = false; }
  };
  useEffect(() => {
    const escape = event => {
      if (event.key === 'Escape' && miniActive.current) {
        event.preventDefault(); event.stopImmediatePropagation(); void restore();
      }
    };
    document.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('keydown', escape, true);
      if (miniActive.current) {
        document.body.classList.remove('lumen-mini');
        void window.lumen.action('mini-exit');
      }
    };
  }, []);
  const [subtitles, setSubtitles] = React.useState([]);
  useEffect(() => {
    let alive = true;
    Promise.all((player.source.externalSubtitles || []).map(async track => ({ ...track,
      uri: /^https?:/.test(track.uri) ? await window.lumen.media(track.uri, player.source.headers) : /^file:/.test(track.uri) ? 'lumen-file://app/?path=' + encodeURIComponent(track.uri) : track.uri
    }))).then(tracks => { if (alive) setSubtitles(tracks); });
    return () => { alive = false; };
  }, [player, player.source]);
  useImperativeHandle(ref, () => ({ canEnterPictureInPicture: () => true, enterPictureInPicture: enterMini, exitPictureInPicture: restore, setFullscreen: value => value ? element.current.requestFullscreen() : document.exitFullscreen() }));
  useEffect(() => {
    player.element = element.current;
    if (window.lumen.diagnostic) element.current.lumenMini = { enter: enterMini, restore };
    player.replaceSourceAsync(player.source).catch(error => player.fail(error.message));
    return () => { player.element = undefined; };
  }, [player]);
  const state = playing => { setPaused(!playing); player.emit('onPlaybackStateChange', { isPlaying: playing }); };
  const video = React.createElement('video', { ref: element, controls, style: { ...StyleSheet.flatten(style), objectFit: resizeMode === 'cover' ? 'cover' : 'contain' },
    onLoadedMetadata: () => { if (player.pendingSeek > 0) { element.current.currentTime = player.pendingSeek; player.pendingSeek = 0; } player.status = 'readyToPlay'; player.emit('onStatusChange', player.status); player.emit('onLoad', { duration: player.duration, width: element.current.videoWidth, height: element.current.videoHeight }); },
    onPlay: () => state(true), onPause: () => state(false), onWaiting: () => player.emit('onBuffer', true), onPlaying: () => player.emit('onBuffer', false),
    onTimeUpdate: () => { const video = element.current; player.emit('onProgress', { currentTime: video.currentTime, bufferDuration: video.buffered.length ? Math.max(0, video.buffered.end(video.buffered.length-1) - video.currentTime) : 0 }); },
    onEnded: () => player.emit('onEnd'), onError: () => player.fail(element.current.error?.message || 'Video playback failed')
  }, subtitles.map((track, index) => React.createElement('track', { key: index, src: track.uri, label: track.label, kind: 'subtitles', srcLang: track.language || 'ru' })));
  return React.createElement(React.Fragment, null, video, mini && createPortal(
    React.createElement(React.Fragment, null,
      React.createElement('div', { id: 'lumen-mini-controls' },
        React.createElement('button', { title: 'Развернуть', 'aria-label': 'Развернуть', onClick: restore }, React.createElement(Maximize2, { size: 26, color: '#fff' }))
      ),
      React.createElement('div', { id: 'lumen-mini-playback' },
        React.createElement('button', { title: 'Предыдущая серия', 'aria-label': 'Предыдущая серия', disabled: !episodeNavigation?.enabled, onClick: episodeNavigation?.previous }, React.createElement(SkipBack, { size: 36, color: '#fff' })),
        React.createElement('button', { title: paused ? 'Воспроизвести' : 'Пауза', 'aria-label': paused ? 'Воспроизвести' : 'Пауза', onClick: () => player.isPlaying ? player.pause() : player.play() }, React.createElement(paused ? Play : Pause, { size: 44, color: '#fff' })),
        React.createElement('button', { title: 'Следующая серия', 'aria-label': 'Следующая серия', disabled: !episodeNavigation?.enabled, onClick: episodeNavigation?.next }, React.createElement(SkipForward, { size: 36, color: '#fff' }))
      )
    ), document.body));
});









