import FilmApiInterface from 'Api/interface/FilmApi.interface';
import FilmType from 'Type/Film.type';
import * as cheerio from 'cheerio';

class FilmApi implements FilmApiInterface {
  async getFilm(): Promise<FilmType> {
    let headers = new Headers({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });
    const response = await fetch('https://rezka-ua.tv/', {
      method: 'GET',
      headers: headers,
    });
    const html = await response.text();

    const $ = cheerio.load(html);

    // $( selector, [context], [root] )
    const test = $('.b-dwnapp-txt').text();

    return {
      info: test,
    };
  }
  getComments(): string {
    throw new Error('Method not implemented.');
  }
}

export default new FilmApi();
