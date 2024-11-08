import Film from 'Type/Film.interface';
import { FilmList } from 'Type/FilmList.interface';
import { CheerioAPI } from 'cheerio';

export enum ApiServiceType {
  rezka = 'rezka',
  //kinokong = 'kinokong',
}

export interface ConfigApiInterface {
  serviceType: ApiServiceType;
  defaultProviders: string[];
  setProvider(provider: string): void;
  getProvider(): string;
  setAuthorization(auth: string): void;
  getAuthorization(): HeadersInit;
  fetchPage(query: string, variables?: Record<string, string>): Promise<CheerioAPI>;
}

export interface FilmApiInterface {
  getFilms(page: number): Promise<FilmList>;
  getFilm(link: string): Promise<Film>;
  getComments(): string;
}

export default interface ApiInterface extends ConfigApiInterface, FilmApiInterface {}
