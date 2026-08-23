/* eslint-disable max-len */
import { ApiInterface, ApiInterfaceConfig, ApiServiceType } from 'Api/type';
import * as Device from 'expo-device';
import { t } from 'i18n/translate';
import NotificationStore from 'Store/Notification.store';
import { ActorInterface, ActorRole } from 'Type/Actor.interface';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { CommentTextInterface, CommentTextType } from 'Type/Comment.interface';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { InfoListInterface } from 'Type/InfoList.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { RatingInterface } from 'Type/Rating.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { VoiceRatingInterface } from 'Type/VoiceRating.interface';
import { buildCookies, cookiesManager, setCookie } from 'Util/Cookies';
import { decodeHtml } from 'Util/Html';
import { safeJsonParse } from 'Util/Json';
import { HTMLElementInterface, parseHtml } from 'Util/Parser';
import { processPromisesBatch } from 'Util/Promise';
import { executeGet, executePostEncoded, executePostFormData, formatURI, NotFoundError, Variables } from 'Util/Request';
import { storage } from 'Util/Storage';
import { updateUrlHost } from 'Util/Url';

import { collectSeriesUpdateRows, parseSeriesUpdateBlocks } from './seriesUpdates';
import {
  CommentResult,
  CommentsResult,
  FILM_SORTING,
  JSONResult,
  LikeResult,
  RatingResult,
  SeasonsResult,
  StreamsResult,
  TrailerResult,
} from './type';
import {
  applyFilmSorting,
  formatDuration,
  getStaticUrl,
  parseActorCard,
  parseFilmCard,
  parseFilmsListRoot,
  parseFilmType,
  parseHelpLink,
  parseSeasons,
  parseStreams,
  parseSubtitles,
} from './utils';

const REZKA_CONFIG = 'rezkaConfig';
const REZKA_PROFILE = 'rezkaProfile';

/** The shared service contract plus the internals only Rezka itself uses */
type RezkaApiInterface = ApiInterface & {
  // configuration
  getConfigFromStorage: () => ApiInterfaceConfig | null;
  loadConfig: () => ApiInterfaceConfig;

  // connection
  getRequest: (query: string, variables?: Variables) => Promise<string>;
  postRequest: (query: string, variables?: Variables) => Promise<string>;
  fetchPage: (query: string, variables?: Variables) => Promise<HTMLElementInterface>;
  postJson: <T>(query: string, variables?: Variables) => Promise<T | null>;

  // utils
  parseContent: (content: string) => HTMLElementInterface;
  stripHtmlFromMessage: (message?: string) => string;
  formatFilmVideo: (json: StreamsResult) => FilmVideoInterface;

  // vars
  recentItems: HTMLElementInterface[] | null;
};

const RezkaApi: RezkaApiInterface = {
  type: ApiServiceType.REZKA,
  name: 'Rezka',

  defaultProviders: [
    'https://rezka.ag',
    'https://rezka-ua.net',
    'http://hdrezka.tv',
    'https://hdrezka.ag',
  ],
  defaultCDNs: [
    'https://prx-cogent.ukrtelcdn.net',
    'https://prx2-cogent.ukrtelcdn.net',
    'https://prx3-cogent.ukrtelcdn.net',
    'https://prx4-cogent.ukrtelcdn.net',
    'https://prx5-cogent.ukrtelcdn.net',
    'https://prx6-cogent.ukrtelcdn.net',
    'https://prx-ams.ukrtelcdn.net',
    'https://stream.voidboost.cc',
    'https://stream.voidboost.top',
    'https://stream.voidboost.link',
    'https://stream.voidboost.club',
  ],
  defaultUserAgent: `Mozilla/5.0 (Linux; Android ${Device.osVersion}; ${Device.manufacturer} ${Device.modelName}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36`,
  officialMirror: 'https://hdrzk.org',
  config: null,
  supportEmail: 'mirror@hdrezka.org',

  /** Configuration */

  getConfigFromStorage() {
    return storage.getConfigStorage().load<ApiInterfaceConfig>(REZKA_CONFIG);
  },

  loadConfig() {
    const defaultConfig: ApiInterfaceConfig = {
      provider: this.defaultProviders[0],
      cdn: '',
      autoCdn: true,
      userAgentNew: this.defaultUserAgent,
      officialMode: '1', // back compatibility with old version where this value was a provider, but right now it is boolean and can be any value
      officialModeShareLink: this.defaultProviders[0],
    };

    const config = this.getConfigFromStorage();

    this.config = config ? { ...defaultConfig, ...config } : defaultConfig;

    return this.config;
  },

  getConfig<K extends keyof ApiInterfaceConfig>(key: K): ApiInterfaceConfig[K] {
    const config = this.config ?? this.loadConfig();

    return config[key];
  },

  setConfig(key: keyof ApiInterfaceConfig, value: unknown) {
    const result = storage.getConfigStorage().save(REZKA_CONFIG, {
      ...this.config,
      [key]: value,
    });

    if (!result) {
      NotificationStore.displayError('Failed to save config');

      return;
    }

    this.loadConfig();
  },

  getProvider() {
    if (this.getConfig('officialMode')) {
      return this.officialMirror;
    }

    return this.getConfig('provider');
  },

  getCDN() {
    return this.getConfig('cdn') || this.defaultCDNs[0];
  },

  getHeaders(includeHeaders) {
    const headers: Record<string, string> = {
      'User-Agent': this.getConfig('userAgentNew'),
    };

    if (this.getConfig('officialMode')) {
      headers['X-Hdrezka-Android-App'] = '1';
      headers['X-Hdrezka-Android-App-Version'] = '2.2.1';
    }

    // Requests made outside of customFetch (e.g. the native player) don't get
    // the cookie jar applied for them, so attach it explicitly on demand.
    if (includeHeaders) {
      const { hostname } = new URL(this.getProvider());
      const cookies = buildCookies(hostname);

      if (cookies) {
        headers.Cookie = cookies;
      }
    }

    return headers;
  },

  async getRequest(query, variables = {}) {
    return executeGet(
      query,
      this.getProvider(),
      this.getHeaders(),
      variables
    );
  },

  async postRequest(query, variables = {} ) {
    return executePostFormData(
      `${query}/?t=${Date.now()}`,
      this.getProvider(),
      this.getHeaders(),
      variables
    );
  },

  async fetchPage(query, variables = {}) {
    const res = await this.getRequest(query, variables);

    return this.parseContent(res);
  },

  async postJson<T>(query: string, variables: Variables = {}) {
    const result = await this.postRequest(query, variables);

    const json = safeJsonParse<T>(result);

    return json;
  },

  async validateUrl(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      await executeGet(
        url,
        '',
        this.getHeaders(),
        {},
        controller.signal
      );
    } catch (error) {
      console.error(error);
      throw new Error(t('Invalid URL'));
    } finally {
      clearTimeout(timeoutId);
    }
  },

  modifyCDN(streams) {
    const cdn = this.getCDN();

    if (this.getConfig('autoCdn')) {
      return streams;
    }

    return streams.map((stream) => {
      const { url } = stream;

      return {
        ...stream,
        url: updateUrlHost(url, cdn),
      };
    });
  },

  /** Account */

  isSignedIn() {
    const { hostname } = new URL(this.getProvider());
    const cookies = cookiesManager.get(hostname);

    if (!cookies || !cookies['dle_password']) {
      return false;
    }

    return !!cookies['dle_password'].value;
  },

  async login(name, password) {
    const data = await this.postJson<JSONResult>('/ajax/login/', {
      login_name: name,
      login_password: password,
      login_not_save: '0',
    });

    if (!data?.success) {
      throw new Error(this.stripHtmlFromMessage(data?.message));
    }

    // the stored profile belongs to the account of the previous session
    storage.getMiscStorage().remove(REZKA_PROFILE);
  },

  async logout() {
    cookiesManager.reset();
    storage.getMiscStorage().remove(REZKA_PROFILE);
  },

  /**
   * The profile is persisted, so it is only fetched when there is nothing
   * stored for the current session yet. `login`/`logout` drop the stored copy.
   */
  async getProfile(id) {
    const storedProfile = storage.getMiscStorage().load<ProfileInterface>(REZKA_PROFILE);

    if (storedProfile) {
      return {
        ...storedProfile,
        avatar: getStaticUrl(storedProfile.avatar),
      };
    }

    const url = new URL(this.getProvider());
    const cookies = cookiesManager.get(url.hostname);
    const userId = cookies?.dle_user_id?.value ?? id;

    if (!userId) {
      throw new Error('Something went wrong');
    }

    const root = await this.fetchPage(`/user/${userId}`);

    const premiumNode = root.querySelector('.b-tophead-premuser');
    const avatar = root.querySelector('.b-userprofile__avatar_holder img')?.attributes.src;

    const profile: ProfileInterface = {
      id: userId,
      name: root.querySelector('head title')?.rawText ?? '',
      email: root.querySelector('#email')?.attributes.value ?? '',
      avatar: avatar ? getStaticUrl(avatar) : '',
      premiumDays: premiumNode ? parseInt(
        premiumNode?.rawText.replace('Осталось', '').replace('днейПродлить', '').trim()
      ) : undefined,
    };

    storage.getMiscStorage().save(REZKA_PROFILE, profile);

    return profile;
  },

  async getUserData() {
    const root = await this.fetchPage('/');

    // tracked rows only (the account's subscriptions, marked server-side)
    const notifications = parseSeriesUpdateBlocks(root, (el) => el.querySelectorAll('.tracked'));

    // every update row, so local mode can match them against the local library
    const updates = parseSeriesUpdateBlocks(root, collectSeriesUpdateRows);

    const premiumNode = root.querySelector('.b-tophead-premuser');
    const premiumDays = premiumNode ? parseInt(
      premiumNode?.rawText.replace('Осталось', '').replace('днейПродлить', '').trim()
    ) : undefined;

    return {
      notifications,
      updates,
      premiumDays,
    };
  },

  async getFilmsFromNotifications(notifications) {
    const links = notifications.reduce((acc, notification) => {
      acc.push(...notification.items.map((item) => item.link));

      return acc;
    }, [] as string[]);

    const films = {} as {
      [key: string]: FilmCardInterface;
    };

    const linksUnique = [...new Set(links)];

    const getFilm = async (link: string): Promise<FilmCardInterface> => {
      const root = await this.fetchPage(link);

      const id = root.querySelector('#user-favorites-holder')?.attributes['data-post_id'] ?? '';
      const title = root.querySelector('.b-post__title h1')?.rawText ?? '';
      const poster = root.querySelector('.b-sidecover img')?.attributes.src ?? '';
      const type = parseFilmType(link);

      const infoTable = root.querySelectorAll('.b-post__info tr');
      const subtitle = infoTable.reduce<string[]>((acc, el) => {
        el.childNodes = el.childNodes.filter((node) => node.rawTagName === 'td');
        const key = el.firstChild?.rawText.replace(':', '');
        const value = el.lastChild as HTMLElementInterface | undefined;

        if (key && value) {
          switch (key) {
            case 'Дата выхода': {
              const rel = value.querySelector('a')?.rawText;

              if (rel) {
                acc.push(rel);
              }

              return acc;
            }
            case 'Страна': {
              const countries = value.childNodes
                .filter((node) => node.rawTagName === 'a')
                .map((node) => node.rawText);

              if (countries.length > 0) {
                acc.push(countries[0]);
              }

              return acc;
            }
            case 'Жанр': {
              const genres = value.childNodes
                .filter((node) => node.rawTagName === 'a')
                .map((node) => node.rawText);

              if (genres.length > 0) {
                acc.push(genres[0]);
              }

              return acc;
            }
            default:
              return acc;
          }
        }

        return acc;
      }, []);

      return {
        id,
        link,
        type,
        poster,
        title,
        subtitle: subtitle.join(', '),
      };
    };

    const results = await processPromisesBatch<string, FilmCardInterface>(linksUnique, 3, getFilm);

    results.forEach((result) => {
      films[result.link] = result;
    });

    return notifications.map((notification) => {
      const items = notification.items.map((item) => {
        const film = { ...films[item.link] } as FilmCardInterface;
        film.info = item.info;

        return {
          ...item,
          film,
        };
      });

      return {
        ...notification,
        items,
      };
    });
  },

  getProfileLink(profile) {
    let link = `${this.getProvider()}/user/${profile?.id}/`;

    if (this.getConfig('officialMode')) {
      link = updateUrlHost(link, this.getConfig('officialModeShareLink'));
    }

    return link;
  },

  getPaymentsLink() {
    let link = `${this.getProvider()}/payments/`;

    if (this.getConfig('officialMode')) {
      link = updateUrlHost(link, this.getConfig('officialModeShareLink'));
    }

    return link;
  },

  getShareLink(film) {
    const { link } = film;

    let shareLink = formatURI(link, {}, this.getProvider());

    if (this.getConfig('officialMode')) {
      shareLink = updateUrlHost(shareLink, this.getConfig('officialModeShareLink'));
    }

    return shareLink;
  },

  /** Bookmarks */

  async getBookmarks() {
    const bookmarks: BookmarkInterface[] = [];

    const root = await this.fetchPage(
      '/favorites',
      {}
    );

    root.querySelectorAll('.b-favorites_content__cats_list_item').forEach((el) => {
      const id = el.attributes['data-cat_id'];
      const title = el.querySelector('.name')?.rawText;

      if (id && title) {
        bookmarks.push({
          id,
          title,
        });
      }
    });

    if (bookmarks.length > 0) {
      bookmarks[0].filmList = parseFilmsListRoot(root);
    }

    return bookmarks;
  },

  async getBookmarkedFilms(bookmark, page) {
    const { id } = bookmark;

    const filmsList = await this.getFilms(page, `/favorites/${id}`);

    return filmsList;
  },

  async addBookmark(filmId, bookmarkId) {
    const res = await this.postJson<JSONResult>('/ajax/favorites', {
      post_id: filmId,
      cat_id: bookmarkId,
      action: 'add_post',
    });

    if (!res?.success) {
      throw new Error(res?.message);
    }
  },

  // the endpoint toggles, so removal is the same call - awaited, so a failed removal
  // rejects instead of reporting success before the request is even out
  async removeBookmark(filmId, bookmarkId) {
    await this.addBookmark(filmId, bookmarkId);
  },

  /** Recently watched */

  recentItems: null,

  async getRecent(page, params) {
    const { isRefresh } = params || {};
    const itemsPerPage = 20;

    const loadItems = async (): Promise<HTMLElementInterface[]> => {
      const res = await this.fetchPage('/continue', {});
      const parsedItems = res.querySelectorAll('.b-videosaves__list_item');

      const s = parsedItems.slice(1);

      this.recentItems = s;

      return s;
    };

    const items = (this.recentItems && !isRefresh) ? this.recentItems : await loadItems();

    const slicedItems = items.slice((page - 1) * itemsPerPage, (page * itemsPerPage) - 1);

    const recentItems = slicedItems.map((el) => {
      const date = el.querySelector('.date');
      const link = el.querySelector('.title a');
      const info = el.querySelector('.info')?.childNodes[0]?.rawText;
      const additionalInfo = el.querySelector('.new-episode')?.rawText;
      const isWatched = el.classList.contains('watched-row');

      return {
        id: el.querySelector('.delete')?.attributes['data-id'] ?? '',
        link: link?.attributes.href ?? '',
        image: link?.attributes['data-cover_url'] ?? '',
        date: (date ? date.rawText : '').trim(),
        name: (el.querySelector('.title')?.rawText ?? '').trim(),
        info: info ? info.trim() : '',
        additionalInfo: additionalInfo ? additionalInfo.trim() : '',
        isWatched,
      };
    });

    return {
      items: recentItems,
      totalPages: Math.ceil(items.length / itemsPerPage),
    };
  },

  async removeRecent(filmId) {
    const data = await this.postJson<JSONResult>('/engine/ajax/cdn_saves_remove.php', { id: filmId });

    if (!data?.success) {
      throw new Error(this.stripHtmlFromMessage(data?.message));
    }

    return true;
  },

  async hideRecent(filmId) {
    const data = await this.postJson<JSONResult>('/engine/ajax/cdn_saves_view.php', {
      id: filmId,
    });

    if (!data?.success) {
      throw new Error(this.stripHtmlFromMessage(data?.message));
    }

    return data;
  },

  unloadRecentScreen() {
    this.recentItems = null;
  },

  /** Films */

  getHomeMenu: () => {
    return [
      {
        id: 'slider',
        title: t('Hot New Releases'),
        path: '/engine/ajax/get_newest_slider_content.php',
        variables: { 'id': '0' } as Variables,
        key: '.b-newest_slider__wrapper',
      },
      {
        id: 'new',
        title: t('New Releases'),
        path: '/new',
      },
      {
        id: 'watching',
        title: t('Watching Now'),
        path: '/new',
        variables: { 'filter': 'watching' } as Variables,
      },
      {
        id: 'popular',
        title: t('Popular'),
        path: '/new',
        variables: { 'filter': 'popular' } as Variables,
      },
      {
        id: 'soon',
        title: t('Awaiting'),
        path: '/announce',
      },
    ];
  },

  async getHomeMenuFilms(menuItem, page, sort, params) {
    const { path, key, variables = {} } = menuItem;

    const sortVariable = key === '.b-newest_slider__wrapper' ? 'id' : undefined;

    if (sort) {
      applyFilmSorting(sort, variables, sortVariable);
    }

    if (key === '.b-newest_slider__wrapper') {
      const films: FilmCardInterface[] = [];

      const res = await this.postRequest(path, variables);

      const root = this.parseContent(`<div>${res}</div>`);

      const filmElements = root.querySelectorAll('.b-content__inline_item');

      filmElements.forEach((el) => {
        const film = parseFilmCard(el);

        if (film) {
          films.push(film);
        }
      });

      return {
        films,
        totalPages: 1,
      };
    }

    const filmsList = await this.getFilms(page, path, variables, {
      ...params,
      key,
    });

    return filmsList;
  },

  getCategoryMenu: (link) => {
    if (link.includes('/best/')) {
      return [
        {
          id: 'category',
          title: 'Category',
          path: link,
          isHidden: true,
        },
      ];
    }

    return [
      {
        id: 'last',
        title: t('Last Additions'),
        path: link,
        variables: { 'filter': 'last' } as Variables,
      },
      {
        id: 'popular',
        title: t('Popular'),
        path: link,
        variables: { 'filter': 'popular' } as Variables,
      },
      {
        id: 'soon',
        title: t('Awaiting'),
        path: link,
        variables: { 'filter': 'soon' } as Variables,
      },
      {
        id: 'watching',
        title: t('Watching Now'),
        path: link,
        variables: { 'filter': 'watching' } as Variables,
      },
    ];
  },

  getFilmSortingOptions() {
    return [
      {
        label: t('All'),
        value: FILM_SORTING.ALL as string,
      },
      {
        label: t('Films'),
        value: FILM_SORTING.FILMS as string,
      },
      {
        label: t('Series'),
        value: FILM_SORTING.SERIES as string,
      },
      {
        label: t('Multfilms'),
        value: FILM_SORTING.MULFILMS as string,
      },
      {
        label: t('Anime'),
        value: FILM_SORTING.ANIME as string,
      },
    ];
  },

  async getFilms(page, path = '', variables, params, sort){
    const { key } = params || {};

    if (sort && variables) {
      applyFilmSorting(sort, variables);
    }

    let root;

    try {
      root = await this.fetchPage(
        `${path === '/' ? '' : path}/page/${page}/`,
        variables
      );
    } catch (error) {
      // an empty listing (a filter with no films, a page past the last one)
      // answers with a 404 -- an empty result, not a failure
      if (error instanceof NotFoundError) {
        return {
          films: [],
          totalPages: 1,
        };
      }

      throw error;
    }

    const content = key ? root.querySelector(key) : root;

    if (!content) {
      return {
        films: [],
        totalPages: 1,
      };
    }

    return parseFilmsListRoot(content);
  },

  async getFilm(link) {
    // the raw response is kept around: the player payload is only reachable by
    // string search (see below), and re-serializing the parsed tree to get it
    // back would rebuild the whole document for nothing
    const res = await this.getRequest(link, {});
    const root = this.parseContent(res);

    // base data
    const id = root.querySelector('#user-favorites-holder')?.attributes['data-post_id'] ?? '';
    const title = root.querySelector('.b-post__title h1')?.rawText ?? '';
    const poster = root.querySelector('.b-sidecover img')?.attributes.src ?? '';
    const largePoster = root.querySelector('.b-sidecover a')?.attributes.href ?? '';

    const film: FilmInterface = {
      id,
      link,
      type: parseFilmType(link),
      title,
      poster,
      voices: [],
      hasVoices: false,
      hasSeasons: false,
      largePoster,
    };

    film.originalTitle = root.querySelector('.b-post__origtitle')?.rawText;

    const infoTable = root.querySelectorAll('.b-post__info tr');
    infoTable.forEach((el) => {
      el.childNodes = el.childNodes.filter((node) => node.rawTagName === 'td');
      const key = el.firstChild?.rawText.replace(':', '');
      const value = el.lastChild as HTMLElementInterface | undefined;

      if (key && value) {
        switch (key) {
          case 'Рейтинги':
            film.ratingScale = 10;
            film.ratings = value.childNodes.filter((node) => node.rawTagName === 'span').map((node) => {
              const rawLink = (node.childNodes[0] as any)?.attributes?.['href'];

              return {
                text: node.rawText,
                name: node.childNodes[0]?.rawText,
                rating: Number(node.childNodes[2]?.rawText),
                votes: Number(node.childNodes[4]?.rawText.replace('(', '').replace(')', '').replaceAll(' ', '')),
                link: parseHelpLink(rawLink),
              } as RatingInterface;
            });

            break;
          case 'Входит в списки':
            film.includedIn = value.childNodes.reduce((acc: InfoListInterface[], node, idx) => {
              if (node.rawTagName === 'a') {
                acc.push({
                  name: node.rawText,
                  position: String(value.childNodes[idx + 1]?.rawText),
                  link: (node as HTMLElementInterface).attributes.href,
                });
              }

              return acc;
            }, []);
            break;
          case 'Дата выхода':
            film.releaseDate = value.rawText;
            break;
          case 'Страна':
            film.countries = value.childNodes
              .filter((node) => node.rawTagName === 'a')
              .map((node) => ({
                name: node.rawText,
                link: (node as HTMLElementInterface).attributes.href,
              }));
            break;
          case 'Режиссер':
            film.directors = value
              .querySelectorAll('.person-name-item')
              .map((node) => parseActorCard(node, true));
            break;
          case 'Жанр':
            film.genres = value.childNodes
              .filter((node) => node.rawTagName === 'a')
              .map((node) => ({
                name: node.rawText,
                link: (node as HTMLElementInterface).attributes.href,
              }));
            break;
          case 'В качестве':
            break;
          case 'В переводе':
            break;
          case 'Возраст':
            // film.age = value.rawText;
            break;
          case 'Время':
            film.duration = formatDuration(Number(value.rawText.replace(' мин.', '')));
            break;
          case 'Из серии':
            film.fromCollections = value.childNodes
              .filter((node) => node.rawTagName === 'a')
              .map((node) => ({
                name: node.rawText,
                link: (node as HTMLElementInterface).attributes.href,
              }));
            break;
          default:
            if (key.includes('В ролях актеры')) {
              film.actors = el.querySelectorAll('.person-name-item').map(
                (node) => parseActorCard(node)
              );
              break;
            }

            break;
        }
      }
    });

    const rating = root.querySelector('.b-post__rating');
    if (rating) {
      const num = rating.querySelector('.num')?.rawText;
      const votes = rating.querySelector('.votes')?.rawText.replace('(', '').replace(')', '').replaceAll(' ', '');

      film.mainRating = {
        text: `${num} (${votes})`,
        name: 'Rezka',
        rating: Number(num),
        votes: Number(votes),
      };
    }

    film.description = root.querySelector('.b-post__description_text')?.rawText.trim();
    film.isPendingRelease = !!root.querySelector('.b-post__go_status');
    film.isRestricted = !!root.querySelector('.b-player__restricted__block_message');
    film.isRatingPosted = !!root.querySelector('.b-rating .current');

    if (!film.isPendingRelease) {
      // player data
      root.querySelectorAll('.b-translator__item').forEach((el) => {
        const voice: FilmVoiceInterface = {
          id: el.attributes['data-translator_id'],
          identifier: '',
          title: el.attributes.title,
          img: el.querySelector('img')?.attributes.src,
          isCamrip: el.attributes['data-camrip'],
          isDirector: el.attributes['data-director'],
          isAds: el.attributes['data-ad'],
          isActive: el.attributes.class.includes('active'),
          isPremium: el.attributes.class.includes('b-prem_translator'),
        };

        if (voice.isPremium) {
          voice.premiumIcon = `${this.getProvider()}/templates/hdrezka/images/prem-icon.svg`;
        }

        film.voices.push({
          ...voice,
          ...(voice.isActive ? parseSeasons(root) : {}),
        });
      });

      const { voices } = film;

      if (!voices.length) {
        const isMovie = root.querySelector('meta[property=og:type]')?.attributes.content?.includes('video.movie');
        const stringedDoc = res;

        if (isMovie) {
          const index = stringedDoc.indexOf('initCDNMoviesEvents');
          const subString = stringedDoc.substring(
            stringedDoc.indexOf('{"id"', index),
            stringedDoc.indexOf('});', index) + 1
          );
          const jsonObject = JSON.parse(subString);

          const video: FilmVideoInterface = {
            streams: parseStreams(jsonObject.streams),
            storyboardUrl: jsonObject.thumbnails ? this.getProvider() + jsonObject.thumbnails : undefined,
            subtitles: parseSubtitles(
              jsonObject.subtitle,
              jsonObject.subtitle_def,
              jsonObject.subtitle_lns
            ),
          };

          film.voices.push({
            id: '',
            identifier: '',
            title: '',
            isCamrip: '0',
            isDirector: '0',
            isAds: '0',
            isActive: true,
            isPremium: false,
            video,
          });
        } else {
          const startIndex = stringedDoc.indexOf('initCDNSeriesEvents');
          let endIndex = stringedDoc.indexOf('{"id"', startIndex);
          if (endIndex === -1) {
            endIndex = stringedDoc.indexOf('{"url"', startIndex);
          }
          const subString = stringedDoc.substring(startIndex, endIndex);

          film.voices.push({
            id: subString.split(',')[1].replaceAll(' ', ''),
            identifier: '',
            title: '',
            isCamrip: '0',
            isDirector: '0',
            isAds: '0',
            isActive: true,
            isPremium: false,
            ...parseSeasons(root),
          });
        }
      }

      const { seasons = [] } = voices.find(({ isActive }) => isActive) ?? {};
      film.hasSeasons = seasons.length > 0;
      film.hasVoices = film.voices.length > 1;
      film.voices = film.voices.map((voice) => {
        const {
          id: vID,
          isDirector,
          isCamrip,
          isPremium,
          isAds,
        } = voice;

        return {
          ...voice,
          identifier: `${vID}-${isDirector}-${isCamrip}-${isPremium}-${isAds}`,
        };
      });
    }

    // additional info

    film.schedule = root.querySelectorAll('.b-post__schedule_block').map((table) => {
      const scheduleName = table.querySelector('.b-post__schedule_block_title .title')?.rawText ?? '';
      const scheduleItems: ScheduleItemInterface[] = table.querySelectorAll('tr')
        .filter((row) => {
          const tds = row.querySelectorAll('td');

          return tds.length > 2;
        })
        .map((row) => {
          const tds = row.querySelectorAll('td');
          const tableName = tds[0]?.rawText;
          const episodeName = decodeHtml(tds[1]?.querySelector('b')?.rawText ?? '');
          const episodeNameOriginal = decodeHtml(tds[1]?.querySelector('span')?.rawText);
          const td3 = tds[2]?.querySelector('i');
          const isWatched = td3?.attributes.class.includes('watched');
          const watchId = td3?.attributes['data-id'] ?? '';
          const date = tds[3]?.rawText;
          const exists = tds[4]?.rawText ?? '';
          const isReleased = exists.includes('check');

          return {
            id: watchId,
            name: tableName,
            episodeName,
            episodeNameOriginal,
            date,
            releaseDate: exists,
            isWatched,
            isReleased,
          };
        });

      const scheduleHardcodedHeader = `${film.title} - даты выхода серий `;

      const correctedName = scheduleName.includes(scheduleHardcodedHeader)
        ? scheduleName
          .replace(scheduleHardcodedHeader, '')
          .slice(0, -1)
        : scheduleName;

      return {
        name: correctedName,
        items: scheduleItems,
      };
    });

    film.franchise = root.querySelectorAll('.b-post__partcontent_item').map((el) => {
      const partItem = el.querySelector('.title')?.rawText ?? '';
      const partYear = el.querySelector('.year')?.rawText ?? '';
      const partRating = el.querySelector('.rating')?.rawText ?? '';
      const partLink = el.attributes['data-url'];

      return {
        name: partItem,
        year: partYear,
        rating: partRating.includes('dash') ? '0.00' : partRating,
        link: partLink,
      };
    });

    film.related = root.querySelectorAll('.b-sidelist .b-content__inline_item').map(
      (el) => parseFilmCard(el)
    );

    film.bookmarks = root.querySelectorAll('.hd-label-row').map(
      (el) => ({
        id: el.querySelector('input')?.attributes.value ?? '',
        title: el.querySelector('label')?.rawText ?? '',
        isBookmarked: el.querySelector('input')?.attributes.checked === 'checked',
      })
    );

    const voicesRatingHtml = root.querySelector('.b-rgstats__help')?.attributes.title;
    if (voicesRatingHtml) {
      const voicesRatingRoot = this.parseContent(voicesRatingHtml);

      film.voiceRating = voicesRatingRoot.querySelectorAll('.b-rgstats__list_item').map((el) => {
        const vRatingTitle = el.querySelector('.title')?.rawText ?? '';
        const vRatingCount = (el.querySelector('.count')?.rawText ?? '')
          .replace('%', '')
          .replace(',', '.');
        const vRatingImg = el.querySelector('.title img')?.attributes.src;

        return {
          title: vRatingTitle,
          rating: Number(vRatingCount),
          img: vRatingImg ? getStaticUrl(vRatingImg) : undefined,
        } as VoiceRatingInterface;
      });
    }

    return film;
  },

  async getFilmTrailer(filmId) {
    const result = await this.postJson<TrailerResult>('/engine/ajax/gettrailervideo.php', {
      id: filmId,
    });

    if (!result || !result.success) {
      return null;
    }

    const code = result.code;

    const startIndex = code.indexOf('https://');
    const endIndex = code.indexOf('lay=1') + 5;

    return code.substring(startIndex, endIndex);
  },

  async getFilmSeasons(film, voice) {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const result = await this.postJson<SeasonsResult>('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      action: 'get_episodes',
    });

    if (!result) {
      throw new Error('Failed to get seasons');
    }

    const { seasons } = result;
    const { episodes } = result;

    const root = parseHtml(`<div>${seasons}${episodes}</div>`);

    return {
      ...voice,
      ...parseSeasons(root),
    };
  },

  async getFilmStreamsByVoice(film, voice) {
    const { id: filmId } = film;
    const {
      id: voiceId,
      isCamrip,
      isAds,
      isDirector,
    } = voice;

    const json = await this.postJson<StreamsResult>('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      is_camrip: isCamrip,
      is_ads: isAds,
      is_director: isDirector,
      action: 'get_movie',
    });

    if (!json?.success) {
      throw new Error(json?.message);
    }

    try {
      return this.formatFilmVideo(json);
    } catch (error) {
      NotificationStore.displayError(error as Error);

      return {
        streams: [],
      };
    }
  },

  async getFilmStreamsByEpisodeId(film, voice, seasonId, episodeId){
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const json = await this.postJson<StreamsResult>('/ajax/get_cdn_series', {
      id: filmId,
      translator_id: voiceId,
      season: seasonId,
      episode: episodeId,
      action: 'get_stream',
    });

    if (!json?.success) {
      throw new Error(json?.message);
    }

    try {
      return this.formatFilmVideo(json);
    } catch (error) {
      NotificationStore.displayError(error as Error);

      return {
        streams: [],
      };
    }
  },

  async saveWatch(film, voice) {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    this.postJson<JSONResult>('/ajax/send_save', {
      post_id: filmId,
      translator_id: voiceId,
      season: voice.lastSeasonId ?? '0',
      episode: voice.lastEpisodeId ?? '0',
      current_time: '1',
    });

    // res.success is always false for some reason ¯\_(ツ)_/¯

    // if (!res.success) {
    //   throw new Error(res.message);
    // }
  },

  async saveScheduleWatch(id) {
    const data = await this.postJson<JSONResult>('/engine/ajax/schedule_watched.php', { id });

    if (!data?.success) {
      throw new Error(this.stripHtmlFromMessage(data?.message) || 'Something went wrong');
    }
  },

  async postRating(filmId, rating) {
    const data = await this.postJson<RatingResult>('/engine/ajax/rating.php', {
      news_id: filmId,
      go_rate: String(rating),
      skin: 'hdrezka',
    });

    if (!data?.success) {
      throw new Error('Failed to update rating');
    }

    return data;
  },

  /** actor */

  async getActorDetails(link) {
    const root = await this.fetchPage(link);

    const roles = root.querySelectorAll('.b-person__career').map((el) => {
      const role = el.querySelector('h2')?.rawText ?? '';
      const info = el.querySelector('.b-person__career_stats')?.rawText ?? '';
      const films = parseFilmsListRoot(el);

      return {
        role,
        info,
        films: films.films,
      };
    }) as ActorRole[];

    const actor: ActorInterface = {
      name: root.querySelector('.b-post__title .t1')?.rawText ?? '',
      originalName: root.querySelector('.b-post__title .t2')?.rawText ?? '',
      photo: root.querySelector('.b-sidecover img')?.attributes.src ?? '',
      roles,
    };

    const infoTable = root.querySelectorAll('.b-post__info tr');
    infoTable.forEach((el) => {
      el.childNodes = el.childNodes.filter((node) => node.rawTagName === 'td');
      const key = el.firstChild?.rawText.replace(':', '');
      const value = el.lastChild as HTMLElementInterface | undefined;

      if (key && value) {
        switch (key) {
          case 'Дата рождения':

            actor.dob = value?.rawText.trim();
            break;
          case 'Место рождения':

            actor.birthPlace = value?.rawText.trim();
            break;
          case 'Рост':

            actor.height = value?.rawText.trim();
            break;
          case 'Карьера':
            actor.careers = value.childNodes
              .filter((node) => node.rawTagName === 'a')
              .map((node) => node.rawText);
            break;
          default:
            break;
        }
      }
    });

    return actor;
  },

  /** Collections */

  async getCollections(page) {
    const root = await this.fetchPage(`/collections/page/${page}/`);

    const collections = root.querySelectorAll('.b-content__collections_item').map((item) => {
      const title = item.querySelector('.title')?.rawText ?? '';
      const image = item.querySelector('.cover')?.attributes.src ?? '';
      const url = item.attributes['data-url'] ?? '';
      const amount = item.querySelector('.num')?.rawText ?? 0;

      return {
        id: title,
        title,
        image,
        url,
        amount: Number(amount),
      } as ContentCollectionInterface;
    });

    const navs = root.querySelectorAll('.b-navigation a');

    return {
      items: collections,
      totalPages: navs.length > 0 ? Number(navs[navs.length - 2].rawText) : 1,
    };
  },

  /** Search */

  async search(query, page) {
    const root = await this.fetchPage('/search/', {
      do: 'search',
      subaction: 'search',
      q: query,
      page: String(page),
    });

    return parseFilmsListRoot(root);
  },

  async searchSuggestions(query) {
    const res = await this.postRequest('/engine/ajax/search.php', {
      q: query,
    });

    const root = this.parseContent(res);
    const suggestionsItems = root.querySelectorAll('li');

    const arr = suggestionsItems.map((item) => item.querySelector('.enty')?.rawText || '');
    const mArray = new Set(arr);
    const uniqueArray = [...mArray];

    return uniqueArray;
  },

  async loadAdditionalContent() {
    const root = await this.fetchPage('/collections');

    const categories = root.querySelectorAll('li.b-topnav__item').map((cat) => {
      if (cat.classList.contains('single')) {
        return null;
      }

      const categoryName = cat.querySelector('.b-topnav__item-link')?.rawText ?? '';

      const genres = cat.querySelectorAll('select.select-category option').map((item) => {
        const name = item.rawText;
        const value = item.attributes.value;

        return { name, value };
      }).filter((genre, index, self) =>
        index === self.findIndex((g) => g.value === genre.value));

      const years = cat.querySelectorAll('select.select-year option').map((item) => {
        const name = item.rawText;
        const value = item.attributes.value;

        return { name, value };
      }).filter((genre, index, self) =>
        index === self.findIndex((g) => g.value === genre.value));

      return {
        name: categoryName.trim(),
        genres,
        years: [
          { name: 'за последнее время', value: '-1' },
          ...years,
        ],
      };
    }).filter((cat) => cat !== null);

    return categories;
  },

  /** Comments */

  async getComments(filmId, page) {
    const json = await this.getRequest('/ajax/get_comments', {
      t: String(Date.now()),
      news_id: filmId,
      cstart: String(page),
      type: '0',
      comment_id: '0',
      skin: 'hdrezka',
    });

    const result = safeJsonParse<CommentsResult>(json);

    if (!result) {
      throw new Error('Failed to fetch comments');
    }

    const {
      comments: commentsHtml,
      navigation: navigationHtml,
    } = result;

    const commentsRoot = this.parseContent(commentsHtml);
    const navigationRoot = this.parseContent(navigationHtml);

    const comments = commentsRoot.querySelectorAll('.comments-tree-item')
      .map((comment) => {
        const id = comment.attributes['data-id'];
        const avatar = comment.querySelector('.ava img')?.attributes.src ?? '';
        const username = comment.querySelector('.name')?.rawText ?? '';
        const date = comment.querySelector('.date')?.rawText ?? '';
        const indent = comment.attributes['data-indent'];
        const likes = comment.querySelector('.b-comment__like_it')?.attributes['data-likes_num'];
        const isDisabled = comment.querySelector('.show-likes-comment')?.classList.contains('disabled') ?? false;
        const textElements = comment.querySelector('.text div');

        const text = textElements?.childNodes.reduce<CommentTextInterface[]>((acc, el) => {
          let type = CommentTextType.REGULAR;

          switch (el.rawTagName) {
            case 'b':
              type = CommentTextType.BOLD;
              break;
            case 'i':
              type = CommentTextType.INCLINED;
              break;
            case 'u':
              type = CommentTextType.UNDERLINE;
              break;
            case 's':
              type = CommentTextType.CROSSED;
              break;
            case 'br':
              type = CommentTextType.BREAK;
              break;
            default:

              if ((el as any).classList?.contains('text_spoiler')) {
                type = CommentTextType.SPOILER;
              }
              break;
          }

          if (!(el as any).classList?.contains('title_spoiler')) {
            acc.push({
              type,
              text: decodeHtml(el.rawText),
            });
          }

          return acc;
        }, []) ?? [];

        return {
          id,
          avatar,
          username,
          date: date.replace('оставлен ', ''),
          indent: Number(indent),
          likes: Number(likes),
          isDisabled,
          isControls: false,
          text,
        };
      });

    let totalPages = 1;

    const navs = navigationRoot.querySelectorAll('.b-navigation a');
    if (navs.length > 0) {
      totalPages = Number(navs[navs.length - 2].rawText);
    }

    return {
      items: comments,
      totalPages,
    };
  },

  async postLike(commentId) {
    const data = await this.postJson<LikeResult>('/engine/ajax/comments_like.php', {
      id: commentId,
    });

    if (!data?.success) {
      throw new Error('Failed to like a comment');
    }

    return data;
  },

  async postComment(filmId, text, replyToId) {
    const payload: Variables = {
      comments: text,
      post_id: filmId,
      type: '0',
      parent: replyToId ?? '0',
      g_recaptcha_response: '',
      has_adb: '2',
    };

    if (replyToId) {
      payload['replyto_id'] = replyToId;
    }

    // The site's own page sets this once it decides comments are open, and the
    // handler refuses the post without it. Nothing the app fetches hands it to
    // the jar, so seed it before the request builds its Cookie header.
    setCookie(new URL(this.getProvider()).hostname, 'allowed_comments', '1');

    const result = await executePostEncoded(
      '/ajax/add_comment/',
      this.getProvider(),
      {
        ...this.getHeaders(),
        'X-Requested-With': 'XMLHttpRequest',
        Origin: this.getProvider(),
      },
      payload
    );

    const data = safeJsonParse<CommentResult>(result);

    if (!data) {
      throw new Error(this.stripHtmlFromMessage(result).slice(0, 300) || 'Failed to post a comment');
    }

    const rawMessage = data.message as string[] | string | undefined;
    const message = this.stripHtmlFromMessage(
      Array.isArray(rawMessage) ? rawMessage.join(' ') : rawMessage
    );

    if (data.on_moderation) {
      return message ? `Комментарий успешно добавлен. ${message}` : 'Комментарий находится на модерации.';
    }

    if (!data.success) {
      throw new Error(message || 'Failed to post a comment');
    }

    return '';
  },

  /** Utils */

  parseContent(content) {
    const page = parseHtml(content);

    const error = page.querySelector('.error-code');

    if (error) {
      NotificationStore.displayErrorScreen(
        page.querySelector('.error-code div')?.textContent,
        page.querySelector('.error-title')?.textContent,
        t('Try again later')
      );
      throw new Error('Service temporarily unavailable');
    }

    return page;
  },

  stripHtmlFromMessage(message) {
    if (!message) {
      return '';
    }

    try {
      const parsed = parseHtml(`<div>${message}</div>`);

      return parsed.rawText.trim().replace(/\s+/g, ' ');
    } catch {
      return message;
    }
  },

  formatFilmVideo(json: StreamsResult): FilmVideoInterface {
    const streams = parseStreams(json.url);
    const subtitles = parseSubtitles(
      json.subtitle,
      json.subtitle_def,
      json.subtitle_lns
    );

    const result = {
      streams: this.modifyCDN(streams),
      subtitles,
      storyboardUrl: json.thumbnails ? this.getProvider() + json.thumbnails : undefined,
    };

    return result;
  },
};

export default RezkaApi;
