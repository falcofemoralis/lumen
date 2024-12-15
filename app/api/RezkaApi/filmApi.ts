import { ApiParams, FilmApiInterface } from 'Api/index';
import FilmInterface from 'Type/Film.interface';
import FilmCardInterface from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmType } from 'Type/FilmType.type';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { parseHtml } from 'Util/Parser';
import { Variables } from 'Util/Request';
import configApi from './configApi';
import { parseFilmCard, parseSeasons, parseStreams } from './utils';

const filmApi: FilmApiInterface = {
  /**
   * Get films list by params
   * @param page
   * @param path
   * @returns FilmList
   */
  async getFilms(
    page: number,
    path: string = '',
    variables?: Variables,
    params?: ApiParams
  ): Promise<FilmListInterface> {
    const { key, isRefresh } = params || {};
    const films: FilmCardInterface[] = [];

    const $ = await configApi.fetchPage(
      `${path === '/' ? '' : path}/page/${page}/`,
      variables,
      isRefresh
    );

    const content = $(key);

    const filmElements = key
      ? $(content).find('div.b-content__inline_item')
      : $('div.b-content__inline_item');

    filmElements.each((_idx, el) => {
      films.push(parseFilmCard($, el));
    });

    const navs = $('div.b-navigation a');
    let totalPages = 1;
    navs.each((idx, el) => {
      if (idx === navs.length - 2) {
        totalPages = Number($(el).text());
      }
    });

    return {
      films,
      totalPages,
    };
  },

  /**
   * Get film by link
   * @param link
   * @returns Film
   */
  async getFilm(link: string): Promise<FilmInterface> {
    const $ = await configApi.fetchPage(link);

    // base data
    const id = $('#user-favorites-holder').attr('data-post_id') ?? '';
    const title = $('div.b-post__title h1').text() ?? '';
    const poster = $('div.b-sidecover img').attr('src') ?? '';

    const film: FilmInterface = {
      id,
      link,
      type: FilmType.Film,
      title,
      poster,
      voices: [],
      hasVoices: false,
      hasSeasons: false,
    };

    // player data
    $('li.b-translator__item').each((_idx, el) => {
      const voice: FilmVoiceInterface = {
        id: $(el).attr('data-translator_id') ?? '',
        title: $(el).attr('title') ?? '',
        img: $(el).find('img').attr('src'),
        isCamrip: $(el).attr('data-camrip') ?? '0',
        isDirector: $(el).attr('data-director') ?? '0',
        isAds: $(el).attr('data-ads') ?? '0',
        isActive: $(el).attr('class')?.includes('active') ?? false,
        isPremium: $(el).hasClass('b-prem_translator'),
      };

      film.voices.push({
        ...voice,
        ...(voice.isActive ? parseSeasons($) : {}),
      });
    });

    const { voices } = film;

    if (!voices.length) {
      const isMovie = $('meta[property=og:type]').attr('content')?.includes('video.movie');
      const stringedDoc = $.html();

      if (isMovie) {
        const index = stringedDoc.indexOf('initCDNMoviesEvents');
        const subString = stringedDoc.substring(
          stringedDoc.indexOf('{"id"', index),
          stringedDoc.indexOf('});', index) + 1
        );
        const jsonObject = JSON.parse(subString);
        const streams = parseStreams(jsonObject.streams);
        // subtitles = parseSubtitles(jsonObject.subtitle);
        // getThumbnails(jsonObject.thumbnails, trans);

        const video: FilmVideoInterface = {
          streams,
        };

        film.voices.push({
          id: '',
          title: '',
          isCamrip: '0',
          isDirector: '0',
          isAds: '0',
          isActive: true,
          isPremium: false,
          video,
        });
      } else {
        const startIndex = stringedDoc.indexOf('initCDNSeriesEvents');
        let endIndex = stringedDoc.indexOf('{"id"', startIndex);
        if (endIndex === -1) {
          endIndex = stringedDoc.indexOf('{"url"', startIndex);
        }
        const subString = stringedDoc.substring(startIndex, endIndex);

        film.voices.push({
          id: subString.split(',')[1].replaceAll(' ', ''),
          title: '',
          isCamrip: '0',
          isDirector: '0',
          isAds: '0',
          isActive: true,
          isPremium: false,
          ...parseSeasons($),
        });
      }
    }

    const { seasons = [] } = voices.find(({ isActive }) => isActive) ?? {};
    film.hasSeasons = seasons.length > 0;
    film.hasVoices = film.voices.length > 1;

    return film;
  },

  /**
   * Get films streams
   * @param film
   */
  async getFilmStreams(
    film: FilmInterface,
    voice: FilmVoiceInterface
  ): Promise<FilmVideoInterface> {
    const { id: filmId } = film;
    const { id: voiceId, isCamrip, isAds, isDirector } = voice;

    const result = await configApi.postRequest('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      is_camrip: isCamrip,
      is_ads: isAds,
      is_director: isDirector,
      action: 'get_movie',
    });

    const streams = parseStreams(result.url);

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
    episodeId: string
  ): Promise<FilmVideoInterface> {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const result = await configApi.postRequest('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      season: seasonId,
      episode: episodeId,
      action: 'get_stream',
    });

    const streams = parseStreams(result.url);

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
    voice: FilmVoiceInterface
  ): Promise<FilmVoiceInterface> {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const result = await configApi.postRequest('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      action: 'get_episodes',
    });

    const seasons = result.seasons;
    const episodes = result.episodes;

    const $ = parseHtml(`<div>${seasons}${episodes}</div>`);

    return {
      ...voice,
      ...parseSeasons($),
    };
  },

  async getHomeMenuFilms(menuItem: MenuItemInterface, page: number, params?: ApiParams) {
    const { path, key, variables } = menuItem;

    const filmsList = await this.getFilms(page, path, variables, {
      ...params,
      key,
    });

    if (key === '.b-newest_slider__wrapper') {
      filmsList.totalPages = 1;
    }

    console.log(filmsList.films.length);

    return filmsList;
  },
};

export default filmApi;
