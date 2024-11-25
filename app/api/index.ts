import Film from 'Type/Film.interface';
import { FilmList } from 'Type/FilmList.interface';
import { FilmStream } from 'Type/FilmStream.interface';
import { FilmVoice } from 'Type/FilmVoice.interface';
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
  getRequest(query: string, variables?: Record<string, string>): Promise<any>;
  postRequest(query: string, variables?: Record<string, string>): Promise<any>;
}

export interface FilmApiInterface {
  getFilms(page: number): Promise<FilmList>;
  getFilm(link: string): Promise<Film>;
  getFilmStreams(film: Film, voice: FilmVoice): Promise<FilmStream[]>;
  getFilmStreamsByEpisodeId(season: number, episode: number): Promise<FilmStream[]>;
  getFilmSeasons(film: Film, voice: FilmVoice): Promise<FilmVoice>;
}

export default interface ApiInterface extends ConfigApiInterface, FilmApiInterface {}
