import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { HTMLElementInterface } from 'Util/Parser';

import { Variables } from '../util/Request/index';

export enum ApiServiceType {
  rezka = 'rezka',
  // kinokong = 'kinokong',
}

export interface ApiParams {
  key?: string;
  isRefresh?: boolean;
}

export interface ServiceConfigInterface {
  provider: string;
  cdn: string;
  auth: string;
}

export interface ConfigApiInterface {
  serviceType: ApiServiceType;
  defaultProviders: string[];
  defaultCDNs: string[];
  config: ServiceConfigInterface | null;
  formatConfigKey(key: string): string;
  getConfig(): ServiceConfigInterface;
  setProvider(provider: string): void;
  getProvider(): string;
  setCDN(cdn: string): void;
  getCDN(): string;
  setAuthorization(auth: string): void;
  getAuthorization(): string;
  getHeaders(): HeadersInit;
  fetchPage(
    query: string,
    variables?: Variables,
    ignoreCache?: boolean
  ): Promise<HTMLElementInterface>;
  fetchJson<T>(query: string, variables: Variables): Promise<T>;
  getRequest(query: string, variables?: Variables, ignoreCache?: boolean): Promise<any>;
  postRequest(query: string, variables?: Variables, ignoreCache?: boolean): Promise<any>;
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
  getHomeMenuFilms(
    menuItem: MenuItemInterface,
    page: number,
    params?: ApiParams
  ): Promise<FilmListInterface>;
  getBookmarks(): Promise<BookmarkInterface[]>;
  getFilmsFromBookmark(
    bookmark: BookmarkInterface,
    page: number,
  ): Promise<FilmListInterface>;
}

export interface PlayerApiInterface {
  getFilmStreamsByVoice(
    film: FilmInterface,
    voice: FilmVoiceInterface
  ): Promise<FilmVideoInterface>;
  getFilmStreamsByEpisodeId(
    film: FilmInterface,
    voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string
  ): Promise<FilmVideoInterface>;
  getFilmSeasons(
    film: FilmInterface,
    voice: FilmVoiceInterface
  ): Promise<FilmVoiceInterface>;
}

export interface MenuApiInterface {
  getHomeMenu(): MenuItemInterface[];
}

export interface AuthApiInterface {
  login(name: string, password: string): Promise<string>;
  logout(): Promise<void>;
}

export interface ApiInterface extends
  ConfigApiInterface,
  FilmApiInterface,
  MenuApiInterface,
  PlayerApiInterface,
  AuthApiInterface {}
