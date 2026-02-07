import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';

import { HomeScreenComponentProps } from './HomeScreen.type';

export function HomeScreenComponent({
  pagerItems,
  onLoadFilms,
  onUpdateFilms,
}: HomeScreenComponentProps) {
  return (
    <Page>
      <FilmPager
        items={ pagerItems }
        onLoadFilms={ onLoadFilms }
        onUpdateFilms={ onUpdateFilms }
        loadOnInit
      />
    </Page>
  );
}

export default HomeScreenComponent;
