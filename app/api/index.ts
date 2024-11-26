import Film from 'Type/Film.interface';
import { FilmList } from 'Type/FilmList.interface';
import { FilmStream } from 'Type/FilmStream.interface';
import { FilmVideo } from 'Type/FilmVideo.interface';
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
  selectedProvider: string | null;
  selectedCDN: string | null;
  setProvider(provider: string): void;
  getProvider(): string;
  setCDN(cdn: string): void;
  getCDN(): string;
  setAuthorization(auth: string): void;
  getAuthorization(): HeadersInit;
  fetchPage(query: string, variables?: Record<string, string>): Promise<CheerioAPI>;
  getRequest(query: string, variables?: Record<string, string>): Promise<any>;
  postRequest(query: string, variables?: Record<string, string>): Promise<any>;
  modifyCDN(streams: FilmStream[]): FilmStream[];
}

export interface FilmApiInterface {
  getFilms(page: number): Promise<FilmList>;
  getFilm(link: string): Promise<Film>;
  getFilmStreams(film: Film, voice: FilmVoice): Promise<FilmVideo>;
  getFilmStreamsByEpisodeId(
    season: number,
    episode: number,
    film: Film,
    voice: FilmVoice
  ): Promise<FilmVideo>;
  getFilmSeasons(film: Film, voice: FilmVoice): Promise<FilmVoice>;
}

export default interface ApiInterface extends ConfigApiInterface, FilmApiInterface {}
