import { useNavigation } from '@react-navigation/native';
import FilmGrid from 'Component/FilmGrid';
import ThemedButton from 'Component/ThemedButton';
import { useNavigationContext } from 'Context/NavigationContext';
import {
  createContext,
  useEffect, useRef, useState,
} from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  DefaultFocus,
  SpatialNavigationRoot,
  SpatialNavigationScrollView,
  SpatialNavigationView,
  useLockSpatialNavigation,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { noopFn } from 'Util/Function';
import { setTimeoutSafe } from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { styles } from './FilmPager.style.atv';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

export const IsRootActiveContext = createContext<boolean>(true);

export function FilmPagerComponent({
  pagerItems,
  gridStyle,
  onPreLoad,
  onNextLoad,
  onRowFocus = noopFn,
}: FilmPagerComponentProps) {
  const { isMenuOpen } = useNavigationContext();
  const { isFocused: isPageFocused } = useNavigation();
  const { lock, unlock } = useLockSpatialNavigation();
  const [currentRow, setCurrentRow] = useState(0);
  const [selectedPageItemId, setSelectedPageItemId] = useState<string>(pagerItems[0]?.key);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const rowRef = useRef<number>(0);
  const canNavigateMenuRef = useRef<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounce = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (!isPageFocused() || isMenuOpen || !pagerItems.length) {
        return false;
      }

      if (type === SupportedKeys.UP
        && canNavigateMenuRef.current
        && rowRef.current === 0
        && !isMenuActive
      ) {
        setIsMenuActive(true);
        lock();

        return false;
      }

      if (type === SupportedKeys.UP) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeoutSafe(() => {
          canNavigateMenuRef.current = true;
        }, 500);

        return false;
      }

      if (type === SupportedKeys.DOWN && isMenuActive) {
        setIsMenuActive(false);
        unlock();

        return false;
      }

      if (type === SupportedKeys.DOWN) {
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

  const getSelectedPagerItem = () => pagerItems.find(
    ({ key }) => key === selectedPageItemId
  ) ?? pagerItems[0];

  const handleMenuItemChange = (pagerItem: PagerItemInterface) => {
    const { key } = pagerItem;

    if (key !== selectedPageItemId) {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }

      debounce.current = setTimeoutSafe(async () => {
        lock();

        setSelectedPageItemId(key);
        if (!pagerItem.films) {
          await onPreLoad(pagerItem);
        }

        setTimeoutSafe(() => {
          unlock();
        }, 0);
      }, 300);
    }
  };

  const renderMenuItem = (item: PagerItemInterface) => {
    const {
      menuItem: { title },
    } = item;
    const {
      menuItem: { title: selectedTitle },
    } = getSelectedPagerItem();

    return (
      <ThemedButton
        key={ title }
        variant="outlined"
        isSelected={ selectedTitle === title }
        onFocus={ () => handleMenuItemChange(item) }
      >
        { title }
      </ThemedButton>
    );
  };

  const renderTopMenu = () => {
    if (pagerItems.length <= 1) {
      return null;
    }

    return (
      <Animated.View
        style={ [
          styles.menuListWrapper,
          currentRow > 0 && styles.hidden,
        ] }
      >
        <SpatialNavigationRoot isActive={ isMenuActive }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ scale(64) }
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
      </Animated.View>
    );
  };

  const renderPage = () => {
    const pagerItem = getSelectedPagerItem();
    const { films } = pagerItem;

    return (
      <View style={ [styles.grid, gridStyle] }>
        <DefaultFocus>
          <FilmGrid
            films={ films ?? [] }
            onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItem) }
            onItemFocus={ (row: number) => {
              if (rowRef.current !== row) {
                canNavigateMenuRef.current = false;
                rowRef.current = row;
                setCurrentRow(row);
                onRowFocus(row);
              }
            } }
          />
        </DefaultFocus>
      </View>
    );
  };

  return (
    <View>
      { renderTopMenu() }
      { renderPage() }
    </View>
  );
}

export default FilmPagerComponent;
