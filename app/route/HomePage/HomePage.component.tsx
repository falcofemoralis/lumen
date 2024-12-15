import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import React from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { PagerItemInterface } from 'Type/PagerItem.interface';
import { styles } from './HomePage.style';
import { HomePageProps } from './HomePage.type';
import { scale } from 'Util/CreateStyles';

export function HomePageComponent(props: HomePageProps) {
  const { pagerItems, onNextLoad, handlePagerScroll } = props;

  const renderPage = (item: PagerItemInterface) => {
    const { films, pagination } = item;

    if (!films) {
      return null;
    }

    return (
      <FilmGrid
        films={films ?? []}
        pagination={pagination}
        onNextLoad={onNextLoad}
      />
    );
  };

  const renderPages = () => {
    return pagerItems.map((item) => {
      return <View key={item.key}>{renderPage(item)}</View>;
    });
  };

  return (
    <Page>
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePagerScroll}
        pageMargin={scale(16)}
      >
        {renderPages()}
      </PagerView>
    </Page>
  );
}

export default HomePageComponent;
