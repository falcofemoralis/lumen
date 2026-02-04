import { FilmGrid } from 'Component/FilmGrid';
import { ThemedButton } from 'Component/ThemedButton';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  DefaultFocus,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { noopFn } from 'Util/Function';
import { setTimeoutSafe } from 'Util/Misc';

import { componentStyles } from './FilmPager.style.atv';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

const TabButton = memo(({
  title,
  isActive,
  onFocus,
  styles,
}: {
  title: string;
  isActive: boolean;
  onFocus: () => void;
  styles: ThemedStyles
}) => (
  <ThemedButton
    key={ title }
    variant='outlined'
    isSelected={ isActive }
    onFocus={ onFocus }
    style={ styles.tabButton }
  >
    { title }
  </ThemedButton>
));

export function FilmPagerComponent({
  pagerItems,
  gridStyle,
  onPreLoad,
  onNextLoad,
  onRowFocus = noopFn,
}: FilmPagerComponentProps) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePage, setActivePage] = useState(0);

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
        styles={ styles }
      />
    );
  };

  const renderTopMenu = () => {
    if (pagerItems.length <= 1) {
      return null;
    }

    return (
      <Animated.View style={ styles.menuListWrapper }>
        <SpatialNavigationScrollView
          horizontal
          offsetFromStart={ scale(64) }
          style={ styles.menuListScroll }
        >
          <SpatialNavigationView
            direction="horizontal"
            style={ styles.menuList }
          >
            { pagerItems.map((item, idx) => renderMenuItem(item, idx)) }
          </SpatialNavigationView>
        </SpatialNavigationScrollView>
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
            onItemFocus={ onRowFocus }
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
