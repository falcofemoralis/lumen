import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import React from 'react';
import { View } from 'react-native';

import { CATEGORY_MENU_ITEM } from './CategoryPage.config';
import { styles } from './CategoryPage.style';
import { CategoryPageComponentProps } from './CategoryPage.type';

export function CategoryPageComponent({
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: CategoryPageComponentProps) {
  return (
    <Page>
      <View style={ styles.grid }>
        <FilmPager
          menuItems={ [CATEGORY_MENU_ITEM] }
          filmPager={ filmPager }
          onLoadFilms={ onLoadFilms }
          onUpdateFilms={ onUpdateFilms }
          loadOnInit
        />
      </View>
    </Page>
  );
}

export default CategoryPageComponent;
