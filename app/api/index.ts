import FilmInterface from 'Type/Film.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
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
  modifyCDN(streams: FilmStreamInterface[]): FilmStreamInterface[];
}

export interface FilmApiInterface {
  getFilms(page: number): Promise<FilmListInterface>;
  getFilm(link: string): Promise<FilmInterface>;
  getFilmStreams(film: FilmInterface, voice: FilmVoiceInterface): Promise<FilmVideoInterface>;
  getFilmStreamsByEpisodeId(
    film: FilmInterface,
    voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string
  ): Promise<FilmVideoInterface>;
  getFilmSeasons(film: FilmInterface, voice: FilmVoiceInterface): Promise<FilmVoiceInterface>;
}

export default interface ApiInterface extends ConfigApiInterface, FilmApiInterface {}
