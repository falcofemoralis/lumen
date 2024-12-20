import FilmInterface from 'Type/Film.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { Variables } from './../util/Request/index';
import { HTMLElementInterface } from 'Util/Parser';

export enum ApiServiceType {
  rezka = 'rezka',
  //kinokong = 'kinokong',
}

export interface ApiParams {
  key?: string;
  isRefresh?: boolean;
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
  fetchPage(
    query: string,
    variables?: Variables,
    ignoreCache?: boolean
  ): Promise<HTMLElementInterface>;
  getRequest(query: string, variables?: Variables): Promise<any>;
  postRequest(query: string, variables?: Variables): Promise<any>;
  modifyCDN(streams: FilmStreamInterface[]): FilmStreamInterface[];
}

export interface FilmApiInterface {
  getFilms(
    page: number,
    path?: string,
    variables?: Variables,
    params?: ApiParams
  ): Promise<FilmListInterface>;
  getFilm(link: string): Promise<FilmInterface | null>;
  getFilmStreams(film: FilmInterface, voice: FilmVoiceInterface): Promise<FilmVideoInterface>;
  getFilmStreamsByEpisodeId(
    film: FilmInterface,
    voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string
  ): Promise<FilmVideoInterface>;
  getFilmSeasons(film: FilmInterface, voice: FilmVoiceInterface): Promise<FilmVoiceInterface>;
  getHomeMenuFilms(
    menuItem: MenuItemInterface,
    page: number,
    params?: ApiParams
  ): Promise<FilmListInterface>;
}

export interface MenuApiInterface {
  getHomeMenu(): MenuItemInterface[];
}

export default interface ApiInterface
  extends ConfigApiInterface,
    FilmApiInterface,
    MenuApiInterface {}
