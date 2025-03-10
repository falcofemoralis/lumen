import FilmGrid from 'Component/FilmGrid';
import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedView from 'Component/ThemedView';
import {
  createContext,
  useRef,
} from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { noopFn } from 'Util/Function';

import { styles } from './FilmPager.style.atv';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

export const IsRootActiveContext = createContext<boolean>(true);

export function FilmPagerComponent({
  pagerItems,
  selectedPagerItem,
  isLoading,
  gridStyle,
  onNextLoad,
  handleMenuItemChange,
  onRowFocus = noopFn,
}: FilmPagerComponentProps) {
  const rowRef = useRef<number>(0);

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
        disableRootActive
        onFocus={ () => handleMenuItemChange(item) }
      >
        { title }
      </ThemedButton>
    );
  };

  const renderTopMenu = () => {
    if (!pagerItems.length) {
      return undefined;
    }

    return (
      <View style={ styles.menuListWrapper }>
        <SpatialNavigationScrollView
          horizontal
          offsetFromStart={ scale(64) }
          style={ styles.menuListScroll }
        >
          <SpatialNavigationView
            direction="horizontal"
            style={ styles.menuList }
          >
            { pagerItems.map((item) => renderMenuItem(item)) }
          </SpatialNavigationView>
        </SpatialNavigationScrollView>
      </View>
    );
  };

  const renderPage = () => {
    const { films } = selectedPagerItem;

    return (
      <ThemedView style={ [styles.grid, gridStyle] }>
        <DefaultFocus>
          <FilmGrid
            films={ films ?? [] }
            onNextLoad={ onNextLoad }
            onItemFocus={ (row: number) => {
              if (rowRef.current !== row) {
                rowRef.current = row;
                onRowFocus(row);
              }
            } }
            header={ renderTopMenu() }
            headerSize={ pagerItems.length ? styles.menuListWrapper.height : undefined }
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
      { renderPage() }
    </ThemedView>
  );
}

export default FilmPagerComponent;
