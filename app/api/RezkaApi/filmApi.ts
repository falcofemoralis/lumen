import { FilmVideo } from 'Type/FilmVideo.interface';
import { FilmApiInterface } from 'Api/index';
import Film from 'Type/Film.interface';
import FilmCard from 'Type/FilmCard.interface';
import { FilmList } from 'Type/FilmList.interface';
import { FilmStream } from 'Type/FilmStream.interface';
import { FilmType } from 'Type/FilmType.type';
import { FilmVoice, Season } from 'Type/FilmVoice.interface';
import configApi from './configApi';
import { parseFilmCard, parseSeasons, parseStreams } from './utils';
import { parseHtml } from 'Util/Parser';

const filmApi: FilmApiInterface = {
  /**
   * Get films list by params
   * @param page
   * @returns FilmList
   */
  async getFilms(page: number): Promise<FilmList> {
    const films: FilmCard[] = [];

    const $ = await configApi.fetchPage('/new');

    try {
      const filmElements = $('div.b-content__inline_item');

      filmElements.each((_idx, el) => {
        films.push(parseFilmCard($, el));
      });
    } catch (error) {
      console.log(error);
    }

    return {
      films,
      total: 1,
    };
  },

  /**
   * Get film by link
   * @param link
   * @returns Film
   */
  async getFilm(link: string): Promise<Film> {
    const $ = await configApi.fetchPage(link);

    // basic info
    const id = $('#user-favorites-holder').attr('data-post_id') ?? '';
    const title = $('div.b-post__title h1').text() ?? '';
    const poster = $('div.b-sidecover img').attr('src') ?? '';

    const film: Film = {
      id,
      link,
      type: FilmType.Film,
      title,
      poster,
    };

    // voices and streams
    const voices: FilmVoice[] = [];

    $('li.b-translator__item').each((_idx, el) => {
      const voice: FilmVoice = {
        id: $(el).attr('data-translator_id') ?? '',
        title: $(el).attr('title') ?? '',
        img: $(el).find('img').attr('src'),
        isCamrip: $(el).attr('data-camrip') ?? '0',
        isDirector: $(el).attr('data-director') ?? '0',
        isAds: $(el).attr('data-ads') ?? '0',
        isActive: $(el).attr('class')?.includes('active') ?? false,
        isPremium: $(el).hasClass('b-prem_translator'),
      };

      voices.push({
        ...voice,
        ...(voice.isActive ? parseSeasons($) : {}),
      });
    });

    if (voices.length === 0) {
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

        film.video = {
          streams,
        };
      } else {
        const startIndex = stringedDoc.indexOf('initCDNSeriesEvents');
        let endIndex = stringedDoc.indexOf('{"id"', startIndex);
        if (endIndex === -1) {
          endIndex = stringedDoc.indexOf('{"url"', startIndex);
        }
        const subString = stringedDoc.substring(startIndex, endIndex);

        voices.push({
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

    film.voices = voices;

    return film;
  },

  /**
   * Get films streams
   * @param film
   */
  async getFilmStreams(film: Film, voice: FilmVoice): Promise<FilmVideo> {
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
   * Get film streams by episode and season id
   * @param season
   * @param episode
   */
  getFilmStreamsByEpisodeId(
    season: number,
    episode: number,
    film: Film,
    voice: FilmVoice
  ): Promise<FilmVideo> {
    throw new Error('Function not implemented.');
  },

  /**
   * Get film seasons
   * @param film
   * @param voice
   */
  async getFilmSeasons(film: Film, voice: FilmVoice): Promise<FilmVoice> {
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

  /**
  async getFilmStreams(film: Film): Promise<FilmVideoStream[]> {
    val data: ArrayMap<String, String> = ArrayMap()
    data["id"] = filmId.toString()
    data["translator_id"] = translation.id
    data["is_camrip"] = translation.isCamrip
    data["is_ads"] = translation.isAds
    data["is_director"] = translation.isDirector
    data["action"] = "get_movie"

    val unixTime = System.currentTimeMillis()
    val result: Document? = BaseModel.getJsoup(SettingsData.provider + GET_STREAM_POST + "/?t=$unixTime")
        .data(data)
        .header("Cookie", CookieManager.getInstance().getCookie(SettingsData.provider) + "; allowed_comments=1; _ym_isad=1; _ym_visorc=b; dle_newpm=0;")
        .post()

    const result = await configApi.postRequest('/ajax/get_cdn_series/?t=1731242387831', {
      id: '75112',
      translator_id: '238',
      is_camrip: '0',
      is_ads: '0',
      is_director: '0',
      favs: '46bf4f1c-984b-4653-a7ae-0593110e9d08',
      action: 'get_movie',
    });

    try {
      console.log(utils.parseStreams(result.url));
      const streams = utils.parseStreams(result.url);

      // TODO
      const updatedStreams = streams.map((stream) => {
        return {
          ...stream,
          url: stream.url.replace(
            'https://stream.voidboost.cc',
            'https://prx-cogent.ukrtelcdn.net'
          ),
        };
      });

      return {
        streams: updatedStreams,
      };
    } catch (e) {
      console.log(e);
    }

    return {
      streams: [],
    };
  },

  async getFilmStreamsByEpisodeId(): Promise<FilmVideoStream[]> {
    val data: ArrayMap<String, String> = ArrayMap()
    data["id"] = filmId.toString()
    data["translator_id"] = translation.id
    data["season"] = season
    data["episode"] = episode
    data["action"] = "get_stream"

    val unixTime = System.currentTimeMillis()
    val result: Document? = BaseModel.getJsoup(SettingsData.provider + GET_STREAM_POST + "/?t=$unixTime")
        .header("Cookie", CookieManager.getInstance().getCookie(SettingsData.provider) + "; allowed_comments=1; _ym_isad=1; _ym_visorc=b; dle_newpm=0;")
        .data(data)
        .post()
  }

  async getFilmSeasons() {
    val data: ArrayMap<String, String> = ArrayMap()
    data["id"] = filmId.toString()
    data["translator_id"] = translation.id
    data["action"] = "get_episodes"

    val unixTime = System.currentTimeMillis()
    val result: Document? = BaseModel.getJsoup(SettingsData.provider + GET_STREAM_POST + "/?t=$unixTime").data(data).post()
  }
  */
};

export default filmApi;
