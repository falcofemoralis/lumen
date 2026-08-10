import { FilmGrid } from 'Component/FilmGrid';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { setTimeoutSafe } from 'Util/Misc';

import { componentStyles } from './FilmPager.style.atv';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

const TabButton = memo(({
  menuItem,
  isActive,
  onItemFocus,
  styles,
  sorting,
  selectedSortingItem,
  handleSelectSorting,
}: {
  menuItem: PagerItemInterface['menuItem'];
  isActive: boolean;
  onItemFocus: (menuItem: PagerItemInterface['menuItem']) => void;
  styles: ThemedStyles<typeof componentStyles>;
  sorting?: FilmPagerComponentProps['sorting'];
  selectedSortingItem?: DropdownItem;
  handleSelectSorting?: FilmPagerComponentProps['handleSelectSorting'];
}) => {
  const { scale } = useAppTheme();
  const sortingOverlayRef = useRef<ThemedOverlayRef>(null);
  const { id, title } = menuItem;
  const sortingHeightAnim = useSharedValue(0);
  const currentSorting = selectedSortingItem ?? sorting?.[0];

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
        key={ id }
        title={ title }
        selected={ isActive }
        onFocus={ () => onItemFocus(menuItem) }
        onPress={ () => onItemFocus(menuItem) }
        onEnterPress={ handlePress }
        style={ [ styles.tabButton, sorting && styles.tabBarSorting ] }
        contentStyle={ styles.tabButtonContent }
        styleSelected={ styles.tabButtonSelected }
        styleFocused={ styles.tabButtonFocused }
        bottomAdditionalElement={ !sorting ? undefined : (isFocused) => (
          <Animated.Text
            style={ [
              styles.sortingText,
              isFocused && styles.sortingTextFocused,
              sortingAnimatedStyle,
            ] }
          >
            { currentSorting?.label }
          </Animated.Text>
        ) }
      />
      { sorting && (
        <ThemedDropdown
          overlayRef={ sortingOverlayRef }
          data={ sorting }
          value={ currentSorting?.value ?? '' }
          onChange={ handleSelect }
          asOverlay
        />
      ) }
    </>
  );
});

const TopMenu = memo(({
  pagerItems,
  styles,
  sorting,
  selectedSorting,
  menuDefaultFocus,
  handlePageChange,
  handleSelectSorting,
}: Pick<
  FilmPagerComponentProps,
  'pagerItems' | 'sorting' | 'selectedSorting' | 'menuDefaultFocus' | 'handleSelectSorting'
> & {
  handlePageChange: (page: number, pagerItem: PagerItemInterface) => void;
  styles: ThemedStyles<typeof componentStyles>;
}) => {
  const debounce = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const pagerItemsRef = useRef(pagerItems);
  const handlePageChangeRef = useRef(handlePageChange);

  useEffect(() => {
    pagerItemsRef.current = pagerItems;
    handlePageChangeRef.current = handlePageChange;
  }, [pagerItems, handlePageChange]);

  useEffect(() => () => {
    if (debounce.current) {
      clearTimeout(debounce.current);
    }
  }, []);

  const handleMenuItemChange = useCallback((menuItem: PagerItemInterface['menuItem']) => {
    const items = pagerItemsRef.current;
    const idx = items.findIndex((item) => item.menuItem?.id === menuItem.id);

    if (idx === -1 || idx === activeIndexRef.current) {
      return;
    }

    activeIndexRef.current = idx;
    setActiveIndex(idx);

    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    debounce.current = setTimeoutSafe(() => {
      handlePageChangeRef.current(idx, items[idx]);
    }, 650);
  }, []);

  return (
    <ThemedScrollView
      horizontal
      containerStyle={ [styles.menuListWrapper, sorting && styles.menuListWrapperWithSorting] }
      style={ styles.menuList }
      autofocus={ menuDefaultFocus }
    >
      { pagerItems.map((item, idx) => (
        <TabButton
          key={ item.menuItem.id }
          menuItem={ item.menuItem }
          isActive={ activeIndex === idx }
          onItemFocus={ handleMenuItemChange }
          styles={ styles }
          sorting={ sorting }
          selectedSortingItem={ selectedSorting?.[item.menuItem.id] }
          handleSelectSorting={ handleSelectSorting }
        />
      )) }
    </ThemedScrollView>
  );
});

export function FilmPagerComponent({
  pagerItems,
  disableEmptyComponent,
  isEmpty,
  hideGrid,
  menuDefaultFocus,
  sorting,
  selectedSorting,
  handleSelectSorting,
  ListHeaderComponent,
  ListEmptyComponent,
  centerEmptyComponent,
  onPreLoad,
  onNextLoad,
  onAtTopChange,
}: FilmPagerComponentProps) {
  const { isLowMode } = useConfigContext();
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();
  const [activePage, setActivePage] = useState(0);
  // The menu is a sibling above the grid (a focus sibling, so the grid's focus
  // never resolves to it), collapsed out of the way once focus leaves the first
  // row. The grid reports first-row crossings via onAtTopChange.
  const [menuVisible, setMenuVisible] = useState(true);
  const menuCollapse = useSharedValue(1);
  const menuHeight = (sorting ? styles.menuListWrapperWithSorting.height : styles.menuListWrapper.height) + scale(16);

  useEffect(() => {
    const collapse = menuVisible ? 1 : 0;

    // In low mode the grid jumps between rows, so the menu has to snap with it --
    // a timed collapse would trail behind the scroll.
    menuCollapse.value = isLowMode ? collapse : withTiming(collapse, { duration: 200 });
  }, [menuVisible, menuCollapse, isLowMode]);

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    height: menuHeight * menuCollapse.value,
    opacity: menuCollapse.value,
  }));

  // pagerItems can shrink (menu items change) while activePage still points past its end
  const currentPagerItem = pagerItems[Math.min(activePage, pagerItems.length - 1)];

  const handleAtTopChange = useCallback((atTop: boolean) => {
    setMenuVisible(atTop);
    onAtTopChange?.(atTop);
  }, [onAtTopChange]);

  const handlePageChange = useCallback((page: number, pagerItem: PagerItemInterface) => {
    setActivePage(page);

    if (!pagerItem.films) {
      onPreLoad(pagerItem);
    }
  }, [onPreLoad]);

  const renderMenu = () => {
    if (pagerItems.length <= 1) {
      return null;
    }

    return (
      <TopMenu
        pagerItems={ pagerItems }
        sorting={ sorting }
        selectedSorting={ selectedSorting }
        menuDefaultFocus={ menuDefaultFocus }
        handleSelectSorting={ handleSelectSorting }
        handlePageChange={ handlePageChange }
        styles={ styles }
      />
    );
  };

  const menu = renderMenu();

  return (
    <View style={ styles.container }>
      { menu && (
        <Animated.View style={ [styles.menuCollapse, menuAnimatedStyle] }>
          { menu }
        </Animated.View>
      ) }
      <FilmGrid
        films={ currentPagerItem?.films ?? [] }
        onNextLoad={ (isRefresh) => currentPagerItem && onNextLoad(isRefresh, currentPagerItem) }
        disableEmptyComponent={ disableEmptyComponent }
        // empty flag it true, films array exist and this array is empty
        isEmpty={ isEmpty && currentPagerItem?.films !== null && !currentPagerItem?.films?.length }
        hideGrid={ hideGrid }
        ListHeaderComponent={ ListHeaderComponent }
        ListEmptyComponent={ ListEmptyComponent }
        centerEmptyComponent={ centerEmptyComponent }
        disableAutofocus={ menuDefaultFocus }
        onAtTopChange={ menu || onAtTopChange ? handleAtTopChange : undefined }
      />
    </View>
  );
}

export default FilmPagerComponent;
