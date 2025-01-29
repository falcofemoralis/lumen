import { BookmarkInterface } from 'Type/Bookmark.interface';
import { HTMLElementInterface } from 'Util/Parser';

import { AccountApiInterface, ApiParams } from '..';
import configApi from './configApi';
import { JSONResult, parseFilmsListRoot } from './utils';

type RezkaAccountApiInterface = AccountApiInterface & {
  recentPage: HTMLElementInterface | null;
};

const accountApi: RezkaAccountApiInterface = {
  recentPage: null,

  /**
   * Get bookmarks
   * @returns Bookmark[]
   */
  async getBookmarks() {
    const bookmarks: BookmarkInterface[] = [];

    const root = await configApi.fetchPage(
      '/favorites',
      {},
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
  async addBookmark(filmId: string) {
    // Implementation for adding a bookmark
  },

  /**
  * Remove a bookmark
  * @param filmId string
  */
  async removeBookmark(filmId: string) {
    // Implementation for removing a bookmark
  },

  /**
   * Get watch later list
   * @returns FilmListInterface
   */
  async getRecent(page: number, params?: ApiParams) {
    const { isRefresh } = params || {};
    const itemsPerPage = 15;
    const start = (page - 1) * itemsPerPage + 1; // 1 means that we start from the second element
    const end = page * itemsPerPage + 1;

    const loadPage = async (): Promise<HTMLElementInterface> => {
      this.recentPage = await configApi.fetchPage('/continue', {});

      return this.recentPage;
    };

    const root = (this.recentPage && !isRefresh) ? this.recentPage : await loadPage();

    const items = root.querySelectorAll(`.b-videosaves__list_item:nth-child(n+${start + 1}):nth-child(-n+${end})`);

    const recentItems = items.map((el) => {
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
      totalPages: 9999, // We don't know the total number of pages
    };
  },

  /**
  * Remove watch later item
  * @param filmId string
  */
  async removeRecent(filmId: string) {
    const data = await configApi.fetchJson<JSONResult>('/engine/ajax/cdn_saves_remove.php', { id: filmId });

    if (!data.success) {
      throw new Error(data.message);
    }

    return true;
  },
};

export default accountApi;
