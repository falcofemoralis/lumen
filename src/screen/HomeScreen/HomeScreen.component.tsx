import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';

import { HomeScreenComponentProps } from './HomeScreen.type';

export function HomeScreenComponent({
  pagerItems,
  sorting,
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
        sorting={ sorting }
      />
    </Page>
  );
}

export default HomeScreenComponent;
