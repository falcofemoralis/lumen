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

      console.log('loaded');
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

  getComments(): string {
    throw new Error('Method not implemented.');
  },
};

export default filmApi;
