import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { parseHtml } from 'Util/Parser';

import { PlayerApiInterface } from '..';
import configApi from './configApi';
import { JSONResult, parseSeasons, parseStreams } from './utils';

type StreamsResult = JSONResult & {url: string};
type SeasonsResult = JSONResult & {seasons: string; episodes: string};

const playerApi: PlayerApiInterface = {
  /**
   * Get films streams
   * @param film
   */
  async getFilmStreamsByVoice(
    film: FilmInterface,
    voice: FilmVoiceInterface,
  ): Promise<FilmVideoInterface> {
    const { id: filmId } = film;
    const {
      id: voiceId,
      isCamrip,
      isAds,
      isDirector,
    } = voice;

    const json = await configApi.fetchJson<StreamsResult>('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      is_camrip: isCamrip,
      is_ads: isAds,
      is_director: isDirector,
      action: 'get_movie',
    });

    if (!json.success) {
      throw new Error(json.message);
    }

    const streams = parseStreams(json.url);

    return {
      streams: configApi.modifyCDN(streams),
    };
  },

  /**
   * Get film streams by season and episode id
   * @param season
   * @param episode
   */
  async getFilmStreamsByEpisodeId(
    film: FilmInterface,
    voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string,
  ): Promise<FilmVideoInterface> {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const json = await configApi.fetchJson<StreamsResult>('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      season: seasonId,
      episode: episodeId,
      action: 'get_stream',
    });

    if (!json.success) {
      throw new Error(json.message);
    }

    const streams = parseStreams(json.url);

    return {
      streams: configApi.modifyCDN(streams),
    };
  },

  /**
   * Get film seasons
   * @param film
   * @param voice
   */
  async getFilmSeasons(
    film: FilmInterface,
    voice: FilmVoiceInterface,
  ): Promise<FilmVoiceInterface> {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const result = await configApi.fetchJson<SeasonsResult>('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      action: 'get_episodes',
    });

    const { seasons } = result;
    const { episodes } = result;

    const root = parseHtml(`<div>${seasons}${episodes}</div>`);

    return {
      ...voice,
      ...parseSeasons(root),
    };
  },
};

export default playerApi;