import { ActorInterface } from 'Type/Actor.interface';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { CommentListInterface } from 'Type/CommentList.interface';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { RecentListInterface } from 'Type/RecentList.interface';
import { SearchableCategoryInterface } from 'Type/SearchableCategoryInterface.interface';
import { UserDataInterface } from 'Type/UserData.interface';
import { Variables } from 'Util/Request';

export enum ApiServiceType {
  REZKA = 'REZKA',
}

export interface ApiInterfaceConfig {
  provider: string;
  cdn: string;
  autoCdn: boolean;
  userAgentNew: string;
  officialMode: string;
  officialModeShareLink: string;
}

export interface ApiParams {
  key?: string;
  isRefresh?: boolean;
}

/** `{ items, totalPages }` shape the paginated endpoints share */
export interface ApiPaginatedInterface<T> {
  items: T[];
  totalPages: number;
}

/** Bare result of an action endpoint, without the service specific payload */
export interface ApiResultInterface {
  success: boolean;
  message: string;
}

export interface ApiSortingOptionInterface {
  label: string;
  value: string;
}

export interface ApiRatingInterface {
  num: number;
  votes: number;
}

export interface ApiLikeInterface {
  count: number;
  type: 'minus' | 'plus';
}

export interface ApiInterface {
  // service description
  type: ApiServiceType;
  name: string;
  defaultProviders: string[];
  defaultCDNs: string[];
  defaultUserAgent: string;
  officialMirror: string;
  supportEmail: string;
  config: ApiInterfaceConfig | null;

  // configuration
  getConfig: <K extends keyof ApiInterfaceConfig>(key: K) => ApiInterfaceConfig[K];
  setConfig: (key: keyof ApiInterfaceConfig, value: unknown) => void;
  getProvider: () => string;
  getCDN: () => string;
  getHeaders: (includeHeaders?: boolean) => Record<string, string>;
  validateUrl: (url: string) => Promise<void>;
  modifyCDN: (streams: FilmStreamInterface[]) => FilmStreamInterface[];

  // account
  isSignedIn: () => boolean;
  login: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: (id?: string) => Promise<ProfileInterface>;
  getUserData: () => Promise<UserDataInterface>;
  getFilmsFromNotifications: (notifications: NotificationInterface[]) => Promise<NotificationInterface[]>;
  getProfileLink: (profile: ProfileInterface) => string;
  getPaymentsLink: () => string;
  getShareLink: (film: FilmInterface) => string;

  // bookmarks
  getBookmarks: () => Promise<BookmarkInterface[]>;
  getBookmarkedFilms: (bookmark: BookmarkInterface, page: number) => Promise<FilmListInterface>;
  addBookmark: (filmId: string, bookmarkId: string) => Promise<void>;
  removeBookmark: (filmId: string, bookmarkId: string) => Promise<void>;

  // recently watched
  getRecent: (page: number, params?: ApiParams) => Promise<RecentListInterface>;
  removeRecent: (filmId: string) => Promise<boolean>;
  hideRecent: (filmId: string) => Promise<ApiResultInterface>;
  unloadRecentScreen: () => void;

  // films
  getHomeMenu: () => MenuItemInterface[];
  getHomeMenuFilms: (
    menuItem: MenuItemInterface,
    page: number,
    sort?: string,
    params?: ApiParams
  ) => Promise<FilmListInterface>;
  getCategoryMenu: (link: string) => MenuItemInterface[];
  getFilmSortingOptions: () => ApiSortingOptionInterface[];
  getFilms: (
    page: number,
    path?: string,
    variables?: Variables,
    params?: ApiParams,
    sort?: string
  ) => Promise<FilmListInterface>;
  getFilm: (link: string) => Promise<FilmInterface | null>;
  getFilmTrailer: (filmId: string) => Promise<string | null>;
  getFilmSeasons: (film: FilmInterface, voice: FilmVoiceInterface) => Promise<FilmVoiceInterface>;
  getFilmStreamsByVoice: (
    film: FilmInterface,
    voice: FilmVoiceInterface
  ) => Promise<FilmVideoInterface>;
  getFilmStreamsByEpisodeId: (
    film: FilmInterface,
    voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string
  ) => Promise<FilmVideoInterface>;
  saveWatch: (film: FilmInterface, voice: FilmVoiceInterface) => Promise<void>;
  saveScheduleWatch: (id: string) => Promise<void>;
  postRating: (filmId: string, rating: number) => Promise<ApiRatingInterface>;

  // actor
  getActorDetails: (link: string) => Promise<ActorInterface>;

  // collections
  getCollections: (page: number) => Promise<ApiPaginatedInterface<ContentCollectionInterface>>;

  // search
  search: (query: string, page: number) => Promise<FilmListInterface>;
  searchSuggestions: (query: string) => Promise<string[]>;
  loadAdditionalContent: () => Promise<SearchableCategoryInterface[]>;

  // comments
  getComments: (filmId: string, page: number) => Promise<CommentListInterface>;
  postLike: (commentId: string) => Promise<ApiLikeInterface>;
  postComment: (filmId: string, text: string, replyToId?: string) => Promise<string|undefined>;
}
