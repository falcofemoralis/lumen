import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';
import { View } from 'react-native';

import { CategoryScreenComponentProps } from './CategoryScreen.type';

export function CategoryScreenComponent({
  pagerItems,
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
          items={ pagerItems }
          onLoadFilms={ onLoadFilms }
          onUpdateFilms={ onUpdateFilms }
          loadOnInit
        />
      </View>
    </Page>
  );
}

export default CategoryScreenComponent;
