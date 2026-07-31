import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';
import { View } from 'react-native';

import { CategoryScreenComponentProps } from './CategoryScreen.type';

export function CategoryScreenComponent({
  pagerItems,
  ...pagerHandlers
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
          pagerItems={ pagerItems }
          { ...pagerHandlers }
        />
      </View>
    </Page>
  );
}

export default CategoryScreenComponent;
