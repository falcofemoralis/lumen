import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';

import { componentStyles } from './CategoryScreen.style';
import { CategoryScreenComponentProps } from './CategoryScreen.type';

export function CategoryScreenComponent({
  pagerItems,
  ...pagerHandlers
}: CategoryScreenComponentProps) {
  const styles = useThemedStyles(componentStyles);

  const renderEmpty = () => (
    <View style={ styles.empty }>
      <InfoBlock
        title={ t('No results found') }
        subtitle={ t('There are no films here yet') }
      />
    </View>
  );

  return (
    <Page>
      <View style={ styles.container }>
        <FilmPager
          pagerItems={ pagerItems }
          { ...pagerHandlers }
          isEmpty
          ListEmptyComponent={ renderEmpty() }
          centerEmptyComponent
        />
      </View>
    </Page>
  );
}

export default CategoryScreenComponent;
