import { fetchPage } from 'Util/Request/Query';
import ApiInterface, { ApiServiceType } from '..';
import Film from 'Type/Film.interface';
import { FilmList } from 'Type/FilmList.interface';

class RezkaApi implements ApiInterface {
  serviceType = ApiServiceType.rezka;
  defaultProviders = ['https://rezka-ua.tv'];

  /**
   * Config fields
   */
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
    const agent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    return {
      'User-Agent': agent,
    };
  }

  async makeRequest(query: string, variables: Record<string, string> = {}) {
    return await fetchPage(query, this.getProvider(), this.getAuthorization(), variables);
  }

  /**
   * Film Api fields
   */
  async getFilms(page: number): Promise<FilmList> {
    const films: Film[] = [];

    const $ = await this.makeRequest('/new');

    try {
      const filmElements = $('div.b-content__inline_item');
      filmElements.each(function (idx, el) {
        films.push({
          id: $(this).attr('data-id') ?? '',
          info: $(el).find('.b-content__inline_item-link a').text(),
        });
      });
    } catch (error) {
      console.log(error);
    }

    return {
      films,
      total: 1,
    };
  }

  async getFilm(): Promise<Film> {
    // const $ = await fetchPage('/');

    // // $( selector, [context], [root] )
    // const test = $('.b-dwnapp-txt').text();

    return {
      id: '1',
      info: '',
    };
  }

  getComments(): string {
    throw new Error('Method not implemented.');
  }
}

export default new RezkaApi();
