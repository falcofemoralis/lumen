import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';
import { View } from 'react-native';

import { CATEGORY_MENU_ITEM } from './CategoryScreen.config';
import { CategoryScreenComponentProps } from './CategoryScreen.type';

export function CategoryScreenComponent({
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: CategoryScreenComponentProps) {
  return (
    <Page>
      <View
        style={ {
          width: '100%',
          height: '100%',
        } }
      >
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

export default CategoryScreenComponent;
