import FilmCard from 'Type/FilmCard.interface';
import { FilmList } from 'Type/FilmList.interface';
import { fetchPage } from 'Util/Request/Query';
import { CheerioAPI, Element } from 'cheerio';
import ApiInterface, { ApiServiceType } from '..';
import { FilmType } from 'Type/FilmType.type';
import Film from 'Type/Film.interface';

class RezkaApi implements ApiInterface {
  serviceType = ApiServiceType.rezka;
  defaultProviders = ['https://rezka-ua.tv'];

  /**************************************************************************
   *                      PROVIDER-RELATED METHODS
   **************************************************************************/

  setProvider(provider: string): void {
    // TODO implement custom provider logic
  }

  getProvider(): string {
    // TODO implement custom provider logic
    return this.defaultProviders[0];
  }

  setAuthorization(auth: string): void {
    // TODO implement custom authorization logic
  }

  getAuthorization(): HeadersInit {
    // TODO need to add Cookie header

    const agent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    return {
      'User-Agent': agent,
    };
  }

  async makeRequest(query: string, variables: Record<string, string> = {}, ignoreCache = false) {
    return await fetchPage(
      query,
      this.getProvider(),
      this.getAuthorization(),
      variables,
      ignoreCache
    );
  }

  /**************************************************************************
   *                      FILM API METHODS
   **************************************************************************/

  async getFilms(page: number): Promise<FilmList> {
    const films: FilmCard[] = [];

    const $ = await this.makeRequest('/new');

    try {
      const filmElements = $('div.b-content__inline_item');

      filmElements.each((_idx, el) => {
        films.push(this.parseFilmCard($, el));
      });

      console.log('loaded');
    } catch (error) {
      console.log(error);
    }

    return {
      films,
      total: 1,
    };
  }

  async getFilm(link: string): Promise<Film> {
    const $ = await this.makeRequest(link);

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
  }

  getComments(): string {
    throw new Error('Method not implemented.');
  }

  /**************************************************************************
   *                      UTILITY METHODS
   **************************************************************************/

  private parseFilmCard($: CheerioAPI, el: Element): FilmCard {
    const parseType = (type: string = '') => {
      if (type.includes('films')) {
        return FilmType.Film;
      } else if (type.includes('series')) {
        return FilmType.Series;
      } else if (type.includes('cartoons')) {
        return FilmType.Multfilm;
      } else if (type.includes('animation')) {
        return FilmType.Anime;
      } else if (type.includes('show')) {
        return FilmType.TVShow;
      }

      return FilmType.Film;
    };

    const id = $(el).attr('data-id') ?? '';
    const link = $(el).find('.b-content__inline_item-link a').attr('href') ?? '';
    const type = parseType($(el).find('.cat').attr('class'));
    const title = $(el).find('.b-content__inline_item-link a').text() ?? '';
    const poster = $(el).find('.b-content__inline_item-cover img').attr('src') ?? '';

    return {
      id,
      link,
      type,
      title,
      poster,
    };
  }
}

export default new RezkaApi();
