import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { PagerItemInterface } from 'Type/PagerItem.interface';
import { styles } from './HomePage.style';
import { HomePageProps } from './HomePage.type';
import { scale } from 'Util/CreateStyles';
import ThemedView from 'Component/ThemedView';
import ThemedText from 'Component/ThemedText';

export function HomePageComponent(props: HomePageProps) {
  const { pagerItems, selectedPagerItem, onNextLoad, handlePagerScroll } = props;

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

  const renderMenuItem = (item: PagerItemInterface) => {
    const {
      menuItem: { title },
    } = item;
    const {
      menuItem: { title: selectedTitle },
    } = selectedPagerItem;

    const isSelected = title === selectedTitle;

    return (
      <ThemedView
        key={title}
        style={[styles.menuItem, isSelected && styles.menuItemSelected]}
      >
        <Pressable>
          <ThemedText style={[styles.menuItemText, isSelected && styles.menuItemTextSelected]}>
            {title}
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  };

  const renderMenuItems = () => {
    return pagerItems.map((item) => renderMenuItem(item));
  };

  const renderTopMenu = () => {
    return (
      <ThemedView style={styles.menuListWrapper}>
        <ScrollView horizontal>{renderMenuItems()}</ScrollView>
      </ThemedView>
    );
  };

  // https://reactnavigation.org/docs/tab-view/

  return (
    <Page>
      {renderTopMenu()}
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
