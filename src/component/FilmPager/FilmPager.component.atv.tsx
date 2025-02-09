import FilmGrid from 'Component/FilmGrid';
import Loader from 'Component/Loader';
import { useMenuContext } from 'Component/NavigationBar/MenuContext';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedView from 'Component/ThemedView';
import { useNavigation } from 'expo-router';
import {
  createContext,
  useEffect, useRef, useState,
} from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationRoot,
  SpatialNavigationScrollView,
  SpatialNavigationView,
  useLockSpatialNavigation,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { noopFn } from 'Util/Function';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

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
  const { isOpen: isMenuOpen } = useMenuContext();
  const { isFocused: isPageFocused } = useNavigation();
  const { lock, unlock } = useLockSpatialNavigation();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const rowRef = useRef<number>(0);
  const canNavigateMenuRef = useRef<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (!isPageFocused() || isMenuOpen || !pagerItems.length) {
        return false;
      }

      if (type === SupportedKeys.Up
        && canNavigateMenuRef.current
        && rowRef.current === 0
        && !isMenuActive
      ) {
        setIsMenuActive(true);
        lock();

        return false;
      }

      if (type === SupportedKeys.Up) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          canNavigateMenuRef.current = true;
        }, 500);

        return false;
      }

      if (type === SupportedKeys.Down && isMenuActive) {
        setIsMenuActive(false);
        unlock();

        return false;
      }

      if (type === SupportedKeys.Down) {
        canNavigateMenuRef.current = false;

        return false;
      }

      return false;
    };

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);

    return () => {
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
    };
  });

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

  const renderTopMenu = () => {
    if (!pagerItems.length) {
      return null;
    }

    return (
      <View style={ styles.menuListWrapper }>
        <SpatialNavigationRoot isActive={ isMenuActive }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ scale(20) }
            style={ styles.menuListScroll }
          >
            <SpatialNavigationView
              direction="horizontal"
              style={ styles.menuList }
            >
              <DefaultFocus>
                { pagerItems.map((item) => renderMenuItem(item)) }
              </DefaultFocus>
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </SpatialNavigationRoot>
      </View>
    );
  };

  const renderPage = () => {
    const { films } = selectedPagerItem;

    return (
      <ThemedView style={ [styles.gridWrapper, gridStyle] }>
        <DefaultFocus>
          <FilmGrid
            films={ films ?? [] }
            onNextLoad={ onNextLoad }
            onItemFocus={ (row: number) => {
              if (rowRef.current !== row) {
                canNavigateMenuRef.current = false;
                rowRef.current = row;
                onRowFocus(row);
              }
            } }
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
