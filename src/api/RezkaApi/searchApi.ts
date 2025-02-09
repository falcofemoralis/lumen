import { SearchApiInterface } from '..';
import configApi from './configApi';
import { parseFilmsListRoot } from './utils';

const searchApi: SearchApiInterface = {
  searchSuggestions: async (query) => {
    const res = await configApi.postRequest('/engine/ajax/search.php', {
      q: query,
    });

    const root = configApi.parseContent(res);

    const suggestionsItems = root.querySelectorAll('li');

    return suggestionsItems.map((item) => item.querySelector('.enty')?.rawText || '');
  },

  search: async (query, page) => {
    const root = await configApi.fetchPage('/search/', {
      do: 'search',
      subaction: 'search',
      q: query,
      page: String(page),
    });

    return parseFilmsListRoot(root);
  },
};

export default searchApi;
