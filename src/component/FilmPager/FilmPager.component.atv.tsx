import FilmGrid from 'Component/FilmGrid';
import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedView from 'Component/ThemedView';
import {
  DefaultFocus,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';

import { styles } from './FilmPager.style.atv';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

export function FilmPagerComponent({
  pagerItems,
  selectedPagerItem,
  isLoading,
  onNextLoad,
  handleMenuItemChange,
}: FilmPagerComponentProps) {
  const renderMenuItem = (item: PagerItemInterface) => {
    const {
      menuItem: { title },
    } = item;
    const {
      menuItem: { title: selectedTitle },
    } = selectedPagerItem;

    return (
      <ThemedButton
        key={ title }
        variant="outlined"
        isSelected={ selectedTitle === title }
        icon={ {
          name: 'dot-fill',
          pack: IconPackType.Octicons,
        } }
        onFocus={ () => handleMenuItemChange(item) }
      >
        { title }
      </ThemedButton>
    );
  };

  const renderMenuItems = () => pagerItems.map((item) => renderMenuItem(item));

  const renderTopMenu = () => (
    <ThemedView style={ styles.menuListWrapper }>
      <SpatialNavigationScrollView
        horizontal
        offsetFromStart={ 20 }
        style={ styles.menuListScroll }
      >
        <SpatialNavigationView
          direction="horizontal"
          style={ styles.menuList }
        >
          { renderMenuItems() }
        </SpatialNavigationView>
      </SpatialNavigationScrollView>
    </ThemedView>
  );

  const renderPage = () => {
    const { films, pagination } = selectedPagerItem;

    return (
      <ThemedView style={ styles.gridWrapper }>
        <DefaultFocus>
          <FilmGrid
            films={ films }
            pagination={ pagination }
            onNextLoad={ onNextLoad }
          />
        </DefaultFocus>
      </ThemedView>
    );
  };

  const renderLoader = () => (
    <Loader
      isLoading={ isLoading }
      fullScreen
    />
  );

  return (
    <ThemedView>
      { renderLoader() }
      { renderTopMenu() }
      { renderPage() }
    </ThemedView>
  );
}

export default FilmPagerComponent;
