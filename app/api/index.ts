import Film from 'Type/Film.interface';
import { FilmList } from 'Type/FilmList.interface';
import { FilmVideo } from 'Type/FilmVideo.interface';
import { CheerioAPI } from 'cheerio';

export enum ApiServiceType {
  rezka = 'rezka',
  //kinokong = 'kinokong',
}

export interface ConfigApiInterface {
  serviceType: ApiServiceType;
  defaultProviders: string[];
  defaultCDNs: string[];
  setProvider(provider: string): void;
  getProvider(): string;
  setAuthorization(auth: string): void;
  getAuthorization(): HeadersInit;
  fetchPage(query: string, variables?: Record<string, string>): Promise<CheerioAPI>;
  postRequest(query: string, variables?: Record<string, string>): Promise<any>;
}

export interface FilmApiInterface {
  getFilms(page: number): Promise<FilmList>;
  getFilm(link: string): Promise<Film>;
  getFilmVideo(film: Film): Promise<FilmVideo>;
}

export default interface ApiInterface extends ConfigApiInterface, FilmApiInterface {}
