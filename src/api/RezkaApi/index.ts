/* eslint-disable max-len */
import { ApiParams, ApiServiceType, ServiceConfigInterface } from 'Api/index';
import * as Device from 'expo-device';
import { t } from 'i18n/translate';
import NotificationStore from 'Store/Notification.store';
import { ActorInterface, ActorRole } from 'Type/Actor.interface';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { CommentTextInterface, CommentTextType } from 'Type/Comment.interface';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmType } from 'Type/FilmType.type';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { InfoListInterface } from 'Type/InfoList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { ModifiedProvider } from 'Type/ModifiedProvider.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { RatingInterface } from 'Type/Rating.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { VoiceRatingInterface } from 'Type/VoiceRating.interface';
import { cookiesManager } from 'Util/Cookies';
import { decodeHtml } from 'Util/Html';
import { safeJsonParse } from 'Util/Json';
import { HTMLElementInterface, parseHtml } from 'Util/Parser';
import { processPromisesBatch } from 'Util/Promise';
import { executeGet, executePost, Variables } from 'Util/Request';
import { storage } from 'Util/Storage';
import { updateUrlHost } from 'Util/Url';

import { CommentsResult, FILM_SORTING, JSONResult, RatingResult, SeasonsResult, StreamsResult, TrailerResult } from './type';
import {
  applyFilmSorting,
  formatDurationWithMoment,
  getStaticUrl,
  parseActorCard,
  parseFilmCard,
  parseFilmsListRoot,
  parseFilmType, parseSeasons,
  parseStreams,
  parseSubtitles,
} from './utils';

const REZKA_CONFIG = 'rezkaConfig';

const RezkaApi = {
  serviceType: ApiServiceType.REZKA,
  defaultProviders: [
    'https://rezka.ag',
    'https://rezka-ua.pub',
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
  config: null as ServiceConfigInterface | null,
  supportEmail: 'mirror@hdrezka.org',

  getConfigFromStorage(): ServiceConfigInterface | null {
    return storage.getConfigStorage().load<ServiceConfigInterface>(REZKA_CONFIG);
  },

  loadConfig() {
    this.config = {
      provider: this.defaultProviders[0],
      cdn: '',
      autoCdn: true,
      auth: '',
      userAgentNew: this.defaultUserAgent,
      officialMode: '1', // back compatibility with old version where this value was a provider, but right now it is boolean and can be any value
      officialModeShareLink: this.defaultProviders[0],
    };

    const config = this.getConfigFromStorage();

    if (config) {
      this.config = {
        ...this.config,
        ...config,
      };
    }

    return this.config;
  },

  getConfig() {
    if (!this.config) {
      this.loadConfig();
    }

    return this.config as ServiceConfigInterface;
  },

  updateConfig(key: keyof ServiceConfigInterface, value: unknown) {
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

  setProvider(provider: string): void {
    this.updateConfig('provider', provider);
  },

  getDefaultProvider(): string {
    return this.getConfig().provider;
  },

  getProvider(): string {
    if (this.isOfficialMode()) {
      return this.officialMirror;
    }

    return this.getDefaultProvider();
  },

  setCDN(cdn: string): void {
    this.updateConfig('cdn', cdn);
  },

  getCDN(): string {
    return this.getConfig().cdn || this.defaultCDNs[0];
  },

  setAutomaticCDN(isActive: boolean): void {
    this.updateConfig('autoCdn', isActive);
  },

  isAutomaticCDN(): boolean {
    return this.getConfig().autoCdn;
  },

  setUserAgent(agent: string): void {
    this.updateConfig('userAgentNew', agent);
  },

  getUserAgent(): string {
    return this.getConfig().userAgentNew;
  },

  setAuthorization(auth: string): void {
    this.updateConfig('auth', auth);
  },

  getAuthorization(): string {
    return this.getConfig().auth;
  },

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'User-Agent': this.getUserAgent(),
    };

    if (this.isOfficialMode()) {
      headers['X-Hdrezka-Android-App'] = '1';
      headers['X-Hdrezka-Android-App-Version'] = '2.2.1';
    }

    return headers;
  },

  parseContent(content: string): HTMLElementInterface {
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

  /**
   * Strip HTML tags from message and return plain text
   * @param message
   * @returns plain text message
   */
  stripHtmlFromMessage(message?: string): string {
    if (!message) {
      return '';
    }

    try {
      const parsed = parseHtml(`<div>${message}</div>`);

      return parsed.rawText.trim().replace(/\s+/g, ' ');
    } catch {
      // If parsing fails, return the original message
      return message;
    }
  },

  /**
     * Fetch page
     * @param query
     * @param variables
     * @returns HTMLElement
     */
  async fetchPage(
    query: string,
    variables: Variables = {}
  ) {
    const res = await this.getRequest(query, variables);

    return this.parseContent(res);
  },

  async fetchJson<T>(query: string, variables: Variables = {}) {
    const result = await this.postRequest(query, variables);

    const json = safeJsonParse<T>(result);

    return json;
  },

  /**
     * Get request
     * @param queryInput
     * @param variables
     * @returns text
     */
  async getRequest(
    queryInput: string,
    variables: Variables = {}
  ) {
    const { query, provider } = this.modifyProvider(queryInput);
    const headers = this.getHeaders();

    return executeGet(
      query,
      provider,
      headers,
      variables
    );
  },

  /**
     * Post request
     * @param queryInput
     * @param variables
     * @returns JSON object
     */
  async postRequest(
    queryInput: string,
    variables: Record<string, string> = {}
  ) {
    const { query, provider } = this.modifyProvider(queryInput);
    const headers = this.getHeaders();

    return executePost(
      `${query}/?t=${Date.now()}`,
      provider,
      headers,
      variables
    );
  },

  /**
  * Modify CDN for streams
  * @param streams
  * @returns streams with modified URLs
  */
  modifyCDN(streams: FilmStreamInterface[]) {
    const cdn = this.getCDN();

    if (this.isAutomaticCDN()) {
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

  /**
  * Modify provider URL
  * @param query
  * @returns ModifiedUrl
  */
  modifyProvider(query: string): ModifiedProvider {
    return {
      query: query,
      provider: this.getProvider(),
    };
  },

  /**
  * Set official mode
  * @param mode
  */
  setOfficialMode(mode: string): void {
    this.updateConfig('officialMode', mode);
  },

  /**
  * Get official mode
  * @returns string
  */
  getOfficialMode(): string {
    return this.getConfig().officialMode;
  },

  /**
   * Set official share link
   * @param link
   */
  setOfficialShareLink(link: string): void {
    this.updateConfig('officialModeShareLink', link);
  },

  /**
   * Get official share link
   */
  getOfficialShareLink(): string {
    return this.getConfig().officialModeShareLink;
  },

  /**
  * Check if official mode is enabled
  * @returns boolean
  */
  isOfficialMode() {
    return !!this.getOfficialMode();
  },

  async getProfile(id?: string) {
    const url = new URL(this.getProvider());
    const cookies = cookiesManager.get(url.hostname);
    const userId = cookies ? cookies.dle_user_id.value : id;

    if (!userId) {
      throw new Error('Something went wrong');
    }

    const root = await this.fetchPage(`/user/${userId}`);

    const premiumNode = root.querySelector('.b-tophead-premuser');

    return {
      id: userId,
      name: root.querySelector('head title')?.rawText ?? '',
      email: root.querySelector('#email')?.attributes.value ?? '',
      avatar: root.querySelector('.b-userprofile__avatar_holder img')?.attributes.src ?? '',
      premiumDays: premiumNode ? parseInt(
        premiumNode?.rawText.replace('Осталось', '').replace('днейПродлить', '').trim()
      ) : undefined,
    };
  },

  /**
   * Get bookmarks
   * @returns Bookmark[]
   */
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

  /**
   * Add a bookmark
   * @param filmId string
   */
  async addBookmark(filmId: string, bookmarkId: string) {
    const res = await this.fetchJson<JSONResult>('/ajax/favorites', {
      post_id: filmId,
      cat_id: bookmarkId,
      action: 'add_post',
    });

    if (!res?.success) {
      throw new Error(res?.message);
    }
  },

  /**
  * Remove a bookmark
  * @param filmId string
  */
  async removeBookmark(filmId: string, bookmarkId: string) {
    this.addBookmark(filmId, bookmarkId);
  },

  recentItems: null as HTMLElementInterface[] | null,

  /**
   * Get watch later list
   * @returns FilmListInterface
   */
  async getRecent(page: number, params?: ApiParams) {
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

    // const items = root.querySelectorAll(`.b-videosaves__list_item:nth-child(n+${start + 1}):nth-child(-n+${end})`);
    const slicedItems = items.slice((page - 1) * itemsPerPage, (page * itemsPerPage) - 1);

    const recentItems = slicedItems.map((el) => {
      const date = el.querySelector('.date');
      const link = el.querySelector('.title a');
      const info = el.querySelector('.info')?.childNodes[0]?.rawText;
      const additionalInfo = el.querySelector('.new-episode')?.rawText;

      return {
        id: el.querySelector('.delete')?.attributes['data-id'] ?? '',
        link: link?.attributes.href ?? '',
        image: link?.attributes['data-cover_url'] ?? '',
        date: (date ? date.rawText : '').trim(),
        name: (el.querySelector('.title')?.rawText ?? '').trim(),
        info: info ? info.trim() : '',
        additionalInfo: additionalInfo ? additionalInfo.trim() : '',
        isWatched: false,
      };
    });

    return {
      items: recentItems,
      totalPages: Math.ceil(items.length / itemsPerPage),
    };
  },

  /**
  * Remove watch later item
  * @param filmId string
  */
  async removeRecent(filmId: string) {
    const data = await this.fetchJson<JSONResult>('/engine/ajax/cdn_saves_remove.php', { id: filmId });

    if (!data?.success) {
      throw new Error(this.stripHtmlFromMessage(data?.message));
    }

    return true;
  },

  unloadRecentScreen() {
    this.recentItems = null;
  },

  async getUserData() {
    const root = await this.fetchPage('/');

    const notifications = root.querySelectorAll('.b-seriesupdate__block').map((el) => {
      const date = el.querySelector('.b-seriesupdate__block_date')?.rawText ?? '';

      const items = el.querySelectorAll('.tracked').map((item) => {
        const season = item.querySelector('.season')?.rawText ?? '';
        const episode = item.querySelector('.cell-2')?.rawText ?? '';
        const info = `${season} - ${episode}`;
        const itemLink = item.querySelector('.b-seriesupdate__block_list_link');

        return {
          name: itemLink?.rawText ?? '',
          link: itemLink?.attributes.href ?? '',
          info,
        };
      });

      return {
        date: date.replace(' развернуть', '').trim(),
        items,
      };
    }) as NotificationInterface[];

    const premiumNode = root.querySelector('.b-tophead-premuser');
    const premiumDays = premiumNode ? parseInt(
      premiumNode?.rawText.replace('Осталось', '').replace('днейПродлить', '').trim()
    ) : undefined;

    return {
      notifications,
      premiumDays,
    };
  },

  async saveScheduleWatch(id: string) {
    const data = await this.fetchJson<JSONResult>('/engine/ajax/schedule_watched.php', { id });

    if (!data?.success) {
      throw new Error(this.stripHtmlFromMessage(data?.message) || 'Something went wrong');
    }
  },

  getPhotoUrl(url: string) {
    return getStaticUrl(url);
  },

  async login(name: string, password: string) {
    const data = await this.fetchJson<JSONResult>('/ajax/login/', {
      login_name: name,
      login_password: password,
      login_not_save: '0',
    });

    if (!data?.success) {
      throw new Error(this.stripHtmlFromMessage(data?.message));
    }

    return 'authorized';
  },

  async logout() {
    cookiesManager.reset();
  },

  async getComments(filmId: string, page: number) {
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

  /**
   * Get films list by params
   * @param page
   * @param path
   * @returns FilmList
   */
  async getFilms(
    page: number,
    path = '',
    variables?: Variables,
    params?: ApiParams,
    sort?: string
  ): Promise<FilmListInterface> {
    const { key } = params || {};

    if (sort && variables) {
      applyFilmSorting(sort, variables);
    }

    const root = await this.fetchPage(
      `${path === '/' ? '' : path}/page/${page}/`,
      variables
    );

    const content = key ? root.querySelector(key) : root;

    if (!content) {
      return {
        films: [],
        totalPages: 1,
      };
    }

    return parseFilmsListRoot(content);
  },

  /**
   * Get film by link
   * @param link
   * @returns Film
   */
  async getFilm(link: string): Promise<FilmInterface | null> {
    const root = await this.fetchPage(link, {});

    // base data
    const id = root.querySelector('#user-favorites-holder')?.attributes['data-post_id'] ?? '';
    const title = root.querySelector('.b-post__title h1')?.rawText ?? '';
    const poster = root.querySelector('.b-sidecover img')?.attributes.src ?? '';
    const largePoster = root.querySelector('.b-sidecover a')?.attributes.href ?? '';

    const film: FilmInterface = {
      id,
      link,
      type: FilmType.FILM,
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
            film.ratings = value.childNodes.filter((node) => node.rawTagName === 'span').map((node) => (
              {
                text: node.rawText,
                name: node.childNodes[0]?.rawText,
                rating: Number(node.childNodes[2]?.rawText),
                votes: Number(node.childNodes[4]?.rawText.replace('(', '').replace(')', '').replaceAll(' ', '')),
              } as RatingInterface
            ));
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
            film.duration = formatDurationWithMoment(Number(value.rawText.replace(' мин.', '')));
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
        const stringedDoc = root.innerHTML;

        if (isMovie) {
          const index = stringedDoc.indexOf('initCDNMoviesEvents');
          const subString = stringedDoc.substring(
            stringedDoc.indexOf('{"id"', index),
            stringedDoc.indexOf('});', index) + 1
          );
          const jsonObject = JSON.parse(subString);

          const video: FilmVideoInterface = {
            streams: parseStreams(jsonObject.streams),
            storyboardUrl: this.getProvider() + jsonObject.thumbnails,
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

  /**
   * Get films from home menu
   * @param menuItem
   * @param page
   * @param sort
   * @param params
   * @returns FilmList
   */
  async getHomeMenuFilms(menuItem: MenuItemInterface, page: number, sort?: string, params?: ApiParams) {
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

  /**
   * Get films from bookmark
   * @param bookmark
   * @param page
   * @returns
   */
  async getBookmarkedFilms(bookmark: BookmarkInterface, page: number) {
    const { id } = bookmark;

    const filmsList = await this.getFilms(page, `/favorites/${id}`);

    return filmsList;
  },

  /**
   * Get actor details
   * @param link
   * @returns
   */
  async getActorDetails(link: string) {
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

  async getFilmsFromNotifications(notifications: NotificationInterface[]) {
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

  getHomeMenu: () => [
    {
      id: 'slider',
      title: 'Горячие Новинки',
      path: '/engine/ajax/get_newest_slider_content.php',
      variables: { id: '0' },
      key: '.b-newest_slider__wrapper',
    },
    {
      id: 'new',
      title: 'Новинки',
      path: '/new',
    },
    {
      id: 'watching',
      title: 'Сейчас смотрят',
      path: '/new',
      variables: { filter: 'watching' },
    },
    {
      id: 'popular',
      title: 'Популярные',
      path: '/new',
      variables: { filter: 'popular' },
    },
    {
      id: 'soon',
      title: 'В ожидании ',
      path: '/announce',
    },
  ] as MenuItemInterface[],

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
      storyboardUrl: this.getProvider() + json.thumbnails,
    };

    return result;
  },

  async getFilmStreamsByVoice(
    film: FilmInterface,
    voice: FilmVoiceInterface
  ): Promise<FilmVideoInterface> {
    const { id: filmId } = film;
    const {
      id: voiceId,
      isCamrip,
      isAds,
      isDirector,
    } = voice;

    const json = await this.fetchJson<StreamsResult>('/ajax/get_cdn_series', {
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

  /**
   * Get film streams by season and episode id
   * @param season
   * @param episode
   */
  async getFilmStreamsByEpisodeId(
    film: FilmInterface,
    voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string
  ): Promise<FilmVideoInterface> {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const json = await this.fetchJson<StreamsResult>('/ajax/get_cdn_series', {
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

  /**
   * Get film seasons
   * @param film
   * @param voice
   */
  async getFilmSeasons(
    film: FilmInterface,
    voice: FilmVoiceInterface
  ): Promise<FilmVoiceInterface> {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    const result = await this.fetchJson<SeasonsResult>('/ajax/get_cdn_series', {
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

  async saveWatch(
    film: FilmInterface,
    voice: FilmVoiceInterface
  ): Promise<void> {
    const { id: filmId } = film;
    const { id: voiceId } = voice;

    this.fetchJson<JSONResult>('/ajax/send_save', {
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

  async searchSuggestions(query: string) {
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

  async search(query: string, page: number) {
    const root = await this.fetchPage('/search/', {
      do: 'search',
      subaction: 'search',
      q: query,
      page: String(page),
    });

    return parseFilmsListRoot(root);
  },

  isSignedIn() {
    const { hostname } = new URL(this.getProvider());
    const cookies = cookiesManager.get(hostname);

    if (!cookies || !cookies['dle_password']) {
      return false;
    }

    return !!cookies['dle_password'].value;
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

  async getCollections(page: number) {
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

  async getFilmTrailer(filmId: string) {
    const result = await this.fetchJson<TrailerResult>('/engine/ajax/gettrailervideo.php', {
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

  async postRating(filmId: string, rating: number) {
    const data = await this.fetchJson<RatingResult>('/engine/ajax/rating.php', {
      news_id: filmId,
      go_rate: String(rating),
      skin: 'hdrezka',
    });

    if (!data?.success) {
      throw new Error('Failed to update rating');
    }

    return data;
  },
};

export default RezkaApi;
