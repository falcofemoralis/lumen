import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedView from 'Component/ThemedView';
import React from 'react';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import ServiceStore from 'Store/Service.store';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { styles } from './HomePage.style.atv';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { films, loadFilms } = props;

  const renderMenuItem = (menuItem: MenuItemInterface) => {
    const { title } = menuItem;

    return (
      <SpatialNavigationFocusableView key={title}>
        {({ isRootActive, isFocused }) => (
          <ThemedButton isSelected={isRootActive && isFocused}>{title}</ThemedButton>
        )}
      </SpatialNavigationFocusableView>
    );
  };

  const renderMenuItems = () => {
    return ServiceStore.getCurrentService()
      .getHomeMenu()
      .map((item) => {
        return renderMenuItem(item);
      });
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
          alignInGrid
          style={styles.menuList}
        >
          {renderMenuItems()}
        </SpatialNavigationView>
      </SpatialNavigationScrollView>
    );
  };

  return (
    <Page testId="homePage">
      <ThemedView style={styles.menuListWrapper}>{renderTopMenu()}</ThemedView>
      <ThemedView style={styles.gridWrapper}>
        <DefaultFocus>
          <FilmGrid
            films={films}
            onNextLoad={loadFilms}
          />
        </DefaultFocus>
      </ThemedView>
    </Page>
  );
}

export default HomePageComponent;
