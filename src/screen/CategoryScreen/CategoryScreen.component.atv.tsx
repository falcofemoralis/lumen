import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';

import { CATEGORY_MENU_ITEM } from './CategoryScreen.config';
import { CategoryScreenComponentProps } from './CategoryScreen.type';

export function CategoryScreenComponent({
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: CategoryScreenComponentProps) {
  return (
    <Page>
      <FilmPager
        menuItems={ [CATEGORY_MENU_ITEM] }
        filmPager={ filmPager }
        onLoadFilms={ onLoadFilms }
        onUpdateFilms={ onUpdateFilms }
        loadOnInit
      />
    </Page>
  );
}

export default CategoryScreenComponent;
