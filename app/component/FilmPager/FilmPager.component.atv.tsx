import FilmGrid from 'Component/FilmGrid';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedView from 'Component/ThemedView';
import { ActivityIndicator } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import Colors from 'Style/Colors';
import { styles } from './FilmPager.style.atv';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

export function FilmPagerComponent(props: FilmPagerComponentProps) {
  const { pagerItems, selectedPagerItem, isLoading, onNextLoad, handleMenuItemChange } = props;

  const renderPage = () => {
    const { films, pagination } = selectedPagerItem;

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
      <ThemedView style={styles.menuListWrapper}>
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
      </ThemedView>
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
    <ThemedView>
      {renderLoader()}
      {renderTopMenu()}
      {renderPage()}
    </ThemedView>
  );
}

export default FilmPagerComponent;
