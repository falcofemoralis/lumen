import { FilmVideo } from './../../type/FilmVideo.interface';
import { FilmApiInterface } from 'Api/index';
import Film from 'Type/Film.interface';
import FilmCard from 'Type/FilmCard.interface';
import { FilmList } from 'Type/FilmList.interface';
import { FilmType } from 'Type/FilmType.type';
import configApi from './configApi';
import { utils } from './utils';

const filmApi: FilmApiInterface = {
  async getFilms(page: number): Promise<FilmList> {
    const films: FilmCard[] = [];

    const $ = await configApi.fetchPage('/new');

    try {
      const filmElements = $('div.b-content__inline_item');

      filmElements.each((_idx, el) => {
        films.push(utils.parseFilmCard($, el));
      });
    } catch (error) {
      console.log(error);
    }

    return {
      films,
      total: 1,
    };
  },

  async getFilm(link: string): Promise<Film> {
    const $ = await configApi.fetchPage(link);

    const id = $('div.div.b-userset__fav_holder').attr('data-post_id') ?? '';
    const title = $('div.b-post__title h1').text() ?? '';
    const poster = $('div.b-sidecover img').attr('src') ?? '';

    return {
      id,
      link,
      type: FilmType.Film,
      title,
      poster,
    };
  },

  async getFilmVideo(film: Film): Promise<FilmVideo> {
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
};

export default filmApi;
