import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import React from 'react';

import { CATEGORY_MENU_ITEM } from './CategoryPage.config';
import { CategoryPageComponentProps } from './CategoryPage.type';

export function CategoryPageComponent({
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: CategoryPageComponentProps) {
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

export default CategoryPageComponent;
