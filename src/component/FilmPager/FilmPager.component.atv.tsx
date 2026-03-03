import { FilmGrid } from 'Component/FilmGrid';
import { ThemedButton } from 'Component/ThemedButton';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { createRef, memo, Ref, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  SpatialNavigationNode,
  SpatialNavigationNodeRef,
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
  ref,
  title,
  isActive,
  onFocus,
  styles,
  isFocusVisible,
}: {
  ref: Ref<SpatialNavigationNodeRef>,
  title: string;
  isActive: boolean;
  onFocus: () => void;
  styles: ThemedStyles<typeof componentStyles>;
  isFocusVisible: boolean;
}) => (
  <ThemedButton
    spatialRef={ ref }
    key={ title }
    variant='outlined'
    isSelected={ isActive }
    onFocus={ onFocus }
    style={ styles.tabButton }
    isFocusVisible={ isFocusVisible }
  >
    { title }
  </ThemedButton>
));

const TopMenu = memo(({
  items,
  handlePageChange,
  styles,
}: FilmPagerComponentProps & {
  handlePageChange: (page: number, pagerItem: PagerItemInterface) => void;
  styles: ThemedStyles<typeof componentStyles>;
}) => {
  const { scale } = useAppTheme();
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const refs = useRef<any[]>(
    items.map(() => createRef<any>())
  );
  const isActiveRef = useRef(false);
  const [isFocusVisible, setIsFocusVisible] = useState(true);

  const handleMenuItemChange = (pagerItem: PagerItemInterface) => {
    if (!isActiveRef.current) {
      setIsFocusVisible(false);

      return;
    }

    const { menuItem: { id: key } = {} } = pagerItem;
    const { menuItem: { id: activeKey } = {} } = items[activeIndex] || {};

    if (key !== activeKey) {
      const idx = items.findIndex((item) => item.menuItem?.id === key);

      setActiveIndex(items.findIndex((item) => item.menuItem?.id === key));

      if (debounce.current) {
        clearTimeout(debounce.current);
      }

      debounce.current = setTimeoutSafe(async () => {
        handlePageChange(idx, pagerItem);
      }, 650);
    }
  };

  const renderMenuItem = (item: PagerItemInterface, idx: number, focusVisible: boolean) => {
    const { menuItem: { title } } = item;

    return (
      <TabButton
        ref={ refs.current[idx] }
        key={ title }
        title={ title }
        isActive={ activeIndex === idx }
        onFocus={ () => handleMenuItemChange(item) }
        styles={ styles }
        isFocusVisible={ focusVisible }
      />
    );
  };

  return (
    <SpatialNavigationNode>
      { ({ isActive }) => {
        isActiveRef.current = isActive;

        if (isActive) {
          // This fixes correct focus on menu when user navigates left\right in the grid. Because Header (Menu top), also uses isAlignInGrid property.
          // See https://github.com/bamlab/react-tv-space-navigation/issues/95#issuecomment-2036199373
          const ref = refs.current[activeIndex];
          requestAnimationFrame(() => {
            if (!isFocusVisible) {
              setIsFocusVisible(true);
            }

            ref?.current?.focus();
          });
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
                alignInGrid={ false }
              >
                { items.map((item, idx) => renderMenuItem(item, idx, isFocusVisible)) }
              </SpatialNavigationView>
            </SpatialNavigationScrollView>
          </View>
        );
      } }
    </SpatialNavigationNode>
  );
});

export function FilmPagerComponent(props: FilmPagerComponentProps) {
  const {
    items,
    gridStyle,
    isGridVisible,
    isEmpty,
    ListHeaderComponent,
    ListEmptyComponent,
    onPreLoad,
    onNextLoad,
    onRowFocus = noopFn,
  } = props;
  const styles = useThemedStyles(componentStyles);
  const [activePage, setActivePage] = useState(0);

  const handlePageChange = useCallback((page: number, pagerItem: PagerItemInterface) => {
    setActivePage(page);

    if (!pagerItem.films) {
      onPreLoad(pagerItem);
    }
  }, [onPreLoad]);

  const renderMenu = () => (
    <TopMenu
      { ...props }
      handlePageChange={ handlePageChange }
      styles={ styles }
    />
  );

  return (
    <View style={ [styles.grid, gridStyle] }>
      <FilmGrid
        films={ items[activePage].films ?? [] }
        onNextLoad={ (isRefresh) => onNextLoad(isRefresh, items[activePage]) }
        onItemFocus={ onRowFocus }
        isGridVisible={ isGridVisible }
        isEmpty={ isEmpty }
        ListHeaderComponent={ items.length > 1 ? renderMenu() : ListHeaderComponent }
        ListEmptyComponent={ ListEmptyComponent }
      />
    </View>
  );
}

export default FilmPagerComponent;
