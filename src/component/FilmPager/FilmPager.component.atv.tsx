import { FilmGrid } from 'Component/FilmGrid';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { createRef, memo, Ref, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
  menuItem,
  isActive,
  onFocus,
  styles,
  isFocusVisible,
  sorting,
  selectedSorting,
  handleSelectSorting,
}: {
  ref: Ref<SpatialNavigationNodeRef>,
  menuItem: PagerItemInterface['menuItem'];
  isActive: boolean;
  onFocus: () => void;
  styles: ThemedStyles<typeof componentStyles>;
  isFocusVisible: boolean;
  sorting?: FilmPagerComponentProps['sorting'];
  selectedSorting?: FilmPagerComponentProps['selectedSorting'];
  handleSelectSorting?: FilmPagerComponentProps['handleSelectSorting'];
}) => {
  const { scale } = useAppTheme();
  const sortingOverlayRef = useRef<ThemedOverlayRef>(null);
  const { id, title } = menuItem;
  const sortingHeightAnim = useSharedValue(0);

  useEffect(() => {
    sortingHeightAnim.value = withTiming(isActive && sorting ? scale(14) : 0, {
      duration: 250,
    });
  }, [isActive, sorting, scale, sortingHeightAnim]);

  const sortingAnimatedStyle = useAnimatedStyle(() => ({
    height: sortingHeightAnim.value,
  }));

  const handlePress = () => {
    if (isActive && sorting) {
      sortingOverlayRef.current?.open();
    }
  };

  const handleSelect = (item: DropdownItem) => {
    handleSelectSorting?.(menuItem, item);
    sortingOverlayRef.current?.close();
  };

  return (
    <>
      <ThemedButton
        spatialRef={ ref }
        key={ id }
        variant='outlined'
        isSelected={ isActive }
        onFocus={ onFocus }
        onPress={ handlePress }
        style={ [
          styles.tabButton,
          sorting && styles.tabBarSorting,
        ] }
        isFocusVisible={ isFocusVisible }
        additionalElement={ !sorting ? undefined : (isFocused) => (
          <Animated.Text
            style={ [
              styles.sortingText,
              isFocused && styles.sortingTextFocused,
              sortingAnimatedStyle,
            ] }
          >
            { selectedSorting?.[id]?.label ?? sorting[0].label }
          </Animated.Text>
        ) }
      >
        { title }
      </ThemedButton>
      { sorting && (
        <ThemedDropdown
          overlayRef={ sortingOverlayRef }
          data={ sorting }
          value={ selectedSorting?.[id]?.value ?? sorting[0].value ?? '' }
          onChange={ handleSelect }
          asOverlay
        />
      ) }
    </>
  );
});

const TopMenu = memo(({
  items,
  styles,
  sorting,
  selectedSorting,
  handlePageChange,
  handleSelectSorting,
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
    const { menuItem } = item;

    return (
      <TabButton
        ref={ refs.current[idx] }
        key={ menuItem.id }
        menuItem={ menuItem }
        isActive={ activeIndex === idx }
        onFocus={ () => handleMenuItemChange(item) }
        styles={ styles }
        isFocusVisible={ focusVisible }
        sorting={ sorting }
        selectedSorting={ selectedSorting }
        handleSelectSorting={ handleSelectSorting }
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
