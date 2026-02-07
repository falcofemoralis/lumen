import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';

import { CategoryScreenComponentProps } from './CategoryScreen.type';

export function CategoryScreenComponent({
  pagerItems,
  onLoadFilms,
  onUpdateFilms,
}: CategoryScreenComponentProps) {
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

export default CategoryScreenComponent;
