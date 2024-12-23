import { withTV } from 'Hooks/withTV';

import SearchPageComponent from './SearchPage.component';
import SearchPageComponentTV from './SearchPage.component.atv';

export function SearchPageContainer() {
  const containerFunctions = {};

  const containerProps = () => ({});

  return withTV(SearchPageComponentTV, SearchPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default SearchPageContainer;
