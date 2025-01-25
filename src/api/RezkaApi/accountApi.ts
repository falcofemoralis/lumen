import { BookmarkInterface } from 'Type/Bookmark.interface';
import { HTMLElementInterface } from 'Util/Parser';

import { AccountApiInterface, ApiParams } from '..';
import configApi from './configApi';
import { JSONResult, parseFilmsListRoot } from './utils';

type RezkaAccountApiInterface = AccountApiInterface & {
  recentItems: HTMLElementInterface[] | null;
};

const accountApi: RezkaAccountApiInterface = {
  recentItems: null,

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
    const itemsPerPage = 20;

    const loadItems = async (): Promise<HTMLElementInterface[]> => {
      const res = await configApi.fetchPage('/continue', {});
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

    if (!data.success) {
      throw new Error(data.message);
    }

    return true;
  },
};

export default accountApi;
