//import KinoKongApi from "./KinoKongApi";
import Film from 'Type/Film.interface';
import { FilmList } from 'Type/FilmList.interface';
import { CheerioAPI } from 'cheerio';

export enum ApiServiceType {
  rezka = 'rezka',
  //kinokong = 'kinokong',
}

export default interface ApiInterface {
  /**
   * Config fields
   */
  serviceType: ApiServiceType;
  defaultProviders: string[];
  setProvider(provider: string): void;
  getProvider(): string;
  setAuthorization(auth: string): void;
  getAuthorization(): HeadersInit;
  makeRequest(query: string, variables: Record<string, string>): Promise<CheerioAPI>;

  /**
   * Film Api fields
   */
  getFilms(page: number): Promise<FilmList>;
  getFilm(): Promise<Film>;
  getComments(): string;
}
