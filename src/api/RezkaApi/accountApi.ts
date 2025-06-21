import { BookmarkInterface } from 'Type/Bookmark.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { cookiesManager } from 'Util/Cookies';
import { HTMLElementInterface } from 'Util/Parser';

import { AccountApiInterface, ApiParams } from '..';
import configApi from './configApi';
import { JSONResult, parseFilmsListRoot } from './utils';

type RezkaAccountApiInterface = AccountApiInterface & {
  recentItems: HTMLElementInterface[] | null;
};

const accountApi: RezkaAccountApiInterface = {
  recentItems: null,

  async getProfile(id?: string) {
    const url = new URL(configApi.getProvider());
    const cookies = cookiesManager.get(url.hostname);
    const userId = cookies ? cookies.dle_user_id.value : id;

    if (!userId) {
      throw new Error('Something went wrong');
    }

    const root = await configApi.fetchPage(`/user/${userId}`);

    return {
      id: userId,
      name: root.querySelector('head title')?.rawText ?? '',
      email: root.querySelector('#email')?.attributes.value ?? '',
      avatar: root.querySelector('.b-userprofile__avatar_holder img')?.attributes.src ?? '',
    };
  },

  /**
   * Get bookmarks
   * @returns Bookmark[]
   */
  async getBookmarks() {
    const bookmarks: BookmarkInterface[] = [];

    const root = await configApi.fetchPage(
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
    const res = await configApi.fetchJson<JSONResult>('/ajax/favorites', {
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

  /**
   * Get watch later list
   * @returns FilmListInterface
   */
  async getRecent(page: number, params?: ApiParams) {
    const { isRefresh } = params || {};
    const itemsPerPage = 20;

    const loadItems = async (): Promise<HTMLElementInterface[]> => {
      const res = await configApi.fetchPage('/continue', {});
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
    const data = await configApi.fetchJson<JSONResult>('/engine/ajax/cdn_saves_remove.php', { id: filmId });

    if (!data?.success) {
      throw new Error(data?.message);
    }

    return true;
  },

  unloadRecentPage() {
    this.recentItems = null;
  },

  async getNotifications() {
    const root = await configApi.fetchPage('/');

    return root.querySelectorAll('.b-seriesupdate__block').map((el) => {
      const date = el.querySelector('.b-seriesupdate__block_date')?.rawText ?? '';

      const items = el.querySelectorAll('.tracked').map((item) => {
        const season = item.querySelector('.season')?.rawText ?? '';
        const episode = item.querySelector('.cell-2')?.rawText ?? '';
        const info = `${season} - ${episode}`;

        return {
          link: item.querySelector('.b-seriesupdate__block_list_link')?.attributes.href ?? '',
          info,
        };
      });

      return {
        date: date.replace(' развернуть', '').trim(),
        items,
      };
    }) as NotificationInterface[];
  },

  async saveScheduleWatch(id: string) {
    const data = await configApi.fetchJson<JSONResult>('/engine/ajax/schedule_watched.php', { id });

    if (!data?.success) {
      throw new Error(data?.message ?? 'Something went wrong');
    }
  },
};

export default accountApi;
