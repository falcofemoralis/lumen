import { TaskIdStorage } from 'Util/Download';
import RezkaApi from '../api/RezkaApi';
import AnixartSourceAdapter from '../source/adapters/AnixartSourceAdapter';
import AnixartPlaybackAdapter from '../source/playback/AnixartPlaybackAdapter';
import RouterStore from '../store/Router.store';
import { navigate } from '../util/Navigation';
import { PLAYER_SCREEN, DOWNLOADS_SCREEN, SETTINGS_SCREEN } from '../navigation/navigationRoutes';
import { sourceAdapters, sourcePlaybackRouter } from '../source';
if (window.lumen.diagnostic) {
  window.lumenDiagnostics = {
    settings() { navigate(SETTINGS_SCREEN); },
    tab(screen) { navigate('Tabs', { screen }); },
    local(session) { RouterStore.pushData(PLAYER_SCREEN, session); navigate(PLAYER_SCREEN); },
    async offline() {
      const film = await AnixartSourceAdapter.getFilm('https://anixart-app.com/release/1');
      const voice = (await AnixartPlaybackAdapter.getFilmVoices(film))[0];
      const selectedVoice = await AnixartPlaybackAdapter.getFilmSeasons(film, voice);
      const original = await AnixartPlaybackAdapter.getFilmStreamsByVoice(film, selectedVoice);
      const stream = original.streams[0], folder = window.lumen.paths.downloads + '/Милый-дом-Чи-ANIXART:1';
      const destination = folder + '/episode.mp4', poster = folder + '/poster.jpg';
      const id = TaskIdStorage.getOrCreate(destination, { url: stream.url, headers: stream.headers, destination, folder,
        film: { ...film, voices: [selectedVoice], poster }, quality: stream.quality, voiceId: voice.id, seasonId: '1', episodeId: '1' });
      const download = async (id, url, destination, headers) => {
        console.log('OFFLINE_PHASE ' + id + ' ' + new URL(url).hostname);
        await new Promise((resolve, reject) => {
          const remove = window.lumen.onDownload(event => {
            if (event.id !== id) return;
            if (event.type === 'done' || event.type === 'error') { remove(); clearTimeout(timer); event.type === 'done' ? resolve() : reject(new Error(event.error)); }
          });
          const timer = setTimeout(() => { remove(); reject(new Error('Offline download timeout')); }, 70000);
          window.lumen.downloadStart({ id, url, headers, destination }).catch(error => { remove(); clearTimeout(timer); reject(error); });
        });
        await window.lumen.downloadComplete(id);
      };
      void download('windows-smoke-poster', film.poster, poster).catch(error => console.log('OPTIONAL_POSTER_ERROR ' + error.message));
      await download(id, stream.url, destination, stream.headers);
      TaskIdStorage.setComplete(destination);
      window.lumenDiagnostics.localSession = { film: { ...film, poster, voices: [selectedVoice] }, voice: selectedVoice,
        video: { streams: [{ url: destination, quality: stream.quality }] }, isOffline: true };
      navigate(DOWNLOADS_SCREEN);
      return { title: film.title, destination, registered: Object.keys(TaskIdStorage.load()).length };
    },
    showDownloads() { navigate(DOWNLOADS_SCREEN); },
    playLocal() {
      RouterStore.pushData(PLAYER_SCREEN, window.lumenDiagnostics.localSession);
      navigate(PLAYER_SCREEN);
    },
    async updates() {
      const data = await RezkaApi.getUserData();
      return { groups: data.updates?.length ?? 0, items: data.updates?.reduce((sum, group) => sum + group.items.length, 0) ?? 0 };
    },
    async rezka() {
      const adapter = sourceAdapters.find(item => item.source === 'REZKA');
      const card = (await adapter.search('Мстители: Финал', 1)).films[0];
      const film = await adapter.getFilm(card.link);
      const voice = film.voices.find(item => !item.isPremium) || film.voices[0];
      const video = await RezkaApi.getFilmStreamsByVoice(film, voice);
      RouterStore.pushData(PLAYER_SCREEN, { film, voice, video, isOffline: false });
      navigate(PLAYER_SCREEN);
      return { title: film.title, streams: video.streams.length };
    },
    async anime() {
      const film = await AnixartSourceAdapter.getFilm('https://anixart-app.com/release/1');
      const voice = (await AnixartPlaybackAdapter.getFilmVoices(film))[0];
      const selectedVoice = await AnixartPlaybackAdapter.getFilmSeasons(film, voice);
      const video = await AnixartPlaybackAdapter.getFilmStreamsByVoice(film, selectedVoice);
      RouterStore.pushData(PLAYER_SCREEN, { film, voice: selectedVoice, video, isOffline: false });
      navigate(PLAYER_SCREEN);
      return { title: film.title, voices: film.voices.length, streams: video.streams.length };
    },
    async sources(query) {
      return Promise.all(sourceAdapters.map(async adapter => {
        try {
          const result = await adapter.search(query, 1);
          return { source: adapter.source, count: result.films.length, titles: result.films.slice(0,3).map(card => card.title) };
        } catch (error) { return { source: adapter.source, error: error.message }; }
      }));
    }
  };
}







