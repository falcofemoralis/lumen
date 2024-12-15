import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedView from 'Component/ThemedView';
import React from 'react';
import { ActivityIndicator } from 'react-native-paper';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import Colors from 'Style/Colors';
import { PagerItemInterface } from 'Type/PagerItem.interface';
import { styles } from './HomePage.style.atv';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { pagerItems, selectedPagerItem, isLoading, onNextLoad, handleMenuItemChange } = props;

  const renderPage = () => {
    const { films, pagination } = selectedPagerItem;

    console.log('home films ', films?.length);

    return (
      <ThemedView style={styles.gridWrapper}>
        <DefaultFocus>
          <FilmGrid
            films={films ?? []}
            pagination={pagination}
            onNextLoad={onNextLoad}
          />
        </DefaultFocus>
      </ThemedView>
    );
  };

  const renderMenuItem = (item: PagerItemInterface) => {
    const {
      menuItem: { title },
    } = item;
    const {
      menuItem: { title: selectedTitle },
    } = selectedPagerItem;

    return (
      <SpatialNavigationFocusableView
        key={title}
        onActive={() => handleMenuItemChange(item)}
      >
        {({ isFocused, isActive }) => (
          <ThemedButton
            variant="outlined"
            isSelected={isFocused || (isActive && selectedTitle === title)}
            icon={{
              name: 'dot-fill',
              pack: IconPackType.Octicons,
            }}
          >
            {title}
          </ThemedButton>
        )}
      </SpatialNavigationFocusableView>
    );
  };

  const renderMenuItems = () => {
    return pagerItems.map((item) => renderMenuItem(item));
  };

  const renderTopMenu = () => {
    return (
      <SpatialNavigationScrollView
        horizontal
        offsetFromStart={20}
        style={styles.menuListScroll}
      >
        <SpatialNavigationView
          direction="horizontal"
          style={styles.menuList}
        >
          {renderMenuItems()}
        </SpatialNavigationView>
      </SpatialNavigationScrollView>
    );
  };

  const renderLoader = () => {
    return (
      <ActivityIndicator
        style={styles.loader}
        animating={isLoading}
        size="large"
        color={Colors.primary}
      />
    );
  };

  return (
    <Page testId="homePage">
      {renderLoader()}
      <ThemedView style={styles.menuListWrapper}>{renderTopMenu()}</ThemedView>
      {/* <PagerView
        ref={pagerViewRef}
        style={styles.pagerView}
        initialPage={0}
        scrollEnabled={false}
      > */}
      {renderPage()}
      {/* </PagerView> */}
    </Page>
  );
}

export default HomePageComponent;
