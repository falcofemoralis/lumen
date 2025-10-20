import { useNavigation } from '@react-navigation/native';
import FilmGrid from 'Component/FilmGrid';
import ThemedButton from 'Component/ThemedButton';
import { useNavigationContext } from 'Context/NavigationContext';
import {
  createContext,
  memo,
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

const TabButton = memo(({
  title,
  isActive,
  onFocus,
  onLayout,
}: {
  title: string;
  isActive: boolean;
  onFocus: () => void;
  onLayout: (width: number) => void;
}) => (
  <View
    key={ title }
    onLayout={ (e) => onLayout(e.nativeEvent.layout.width) }
  >
    <ThemedButton
      variant='transparent'
      isSelected={ isActive }
      onFocus={ onFocus }
      style={ styles.tabButton }
    >
      { title }
    </ThemedButton>
  </View>
));

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
  const [isMenuActive, setIsMenuActive] = useState(false);
  const rowRef = useRef<number>(0);
  const canNavigateMenuRef = useRef<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const tabWidthsRef = useRef<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePage, setActivePage] = useState(0);

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

  const handleMenuItemChange = (pagerItem: PagerItemInterface) => {
    const { key } = pagerItem;

    if (key !== pagerItems[activeIndex].key) {
      const idx = pagerItems.findIndex((item) => item.key === key);

      setActiveIndex(pagerItems.findIndex((item) => item.key === key));

      if (debounce.current) {
        clearTimeout(debounce.current);
      }

      debounce.current = setTimeoutSafe(async () => {
        setActivePage(idx);

        if (!pagerItem.films) {
          await onPreLoad(pagerItem);
        }
      }, 600);
    }
  };

  const renderMenuItem = (item: PagerItemInterface, idx: number) => {
    const {
      menuItem: { title },
    } = item;

    return (
      <TabButton
        key={ title }
        title={ title }
        isActive={ activeIndex === idx }
        onFocus={ () => handleMenuItemChange(item) }
        onLayout={ (width) => tabWidthsRef.current[idx] = width }
      />
    );
  };

  const renderActiveElement = () => {
    const gaspWidth = activeIndex * styles.menuList.gap;
    const width = tabWidthsRef.current[activeIndex];
    const translateX = gaspWidth + tabWidthsRef.current
      .slice(0, activeIndex)
      .reduce((acc, w) => acc + w, 0);

    return (
      <Animated.View
        style={ [
          styles.activeElement,
          !isMenuActive && styles.activeElementUnfocused,
          { width, transform: [{ translateX }],
          }] }
      />
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
        { renderActiveElement() }
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
                { pagerItems.map((item, idx) => renderMenuItem(item, idx)) }
              </DefaultFocus>
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </SpatialNavigationRoot>
      </Animated.View>
    );
  };

  const renderPage = () => {
    const pagerItem = pagerItems[activePage];
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

                if (currentRow > 0) {
                  setCurrentRow(row);
                }

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
