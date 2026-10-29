import { FilmGrid } from 'Component/FilmGrid';
import { FilmList } from 'Component/FilmList';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import { NativeSyntheticEvent, View } from 'react-native';
import { usePagerView } from 'react-native-pager-view';
import {
  OnPageScrollEventData,
  OnPageScrollStateChangedEventData,
  OnPageSelectedEventData,
} from 'react-native-pager-view/lib/typescript/PagerViewNativeComponent';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './FilmPager.style.atv';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

type TabsState = {
  key: string;
  indexes: Set<number>;
};

const EMPTY_INDEXES: ReadonlySet<number> = new Set<number>();

const TabButton = memo(({
  menuItem,
  displayTitle,
  isActive,
  focusKey,
  onPress,
  onFocus,
  styles,
  sorting,
  selectedSorting,
  handleSelectSorting,
}: {
  menuItem: PagerItemInterface['menuItem'];
  displayTitle?: string;
  isActive: boolean;
  focusKey: string;
  onPress: () => void;
  onFocus: () => void;
  styles: ThemedStyles<typeof componentStyles>;
  sorting?: FilmPagerComponentProps['sorting'];
  selectedSorting?: FilmPagerComponentProps['selectedSorting'];
  handleSelectSorting?: FilmPagerComponentProps['handleSelectSorting'];
}) => {
  const sortingOverlayRef = useRef<ThemedOverlayRef>(null);
  const { id, title } = menuItem;

  const handlePress = () => {
    onPress();

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
      <ThemedPressable
        focusKey={ focusKey }
        onFocus={ onFocus }
        onPress={ handlePress }
        onEnterPress={ handlePress }
        style={ styles.tabButton }
        contentStyle={ styles.tabButtonContent }
        hitSlop={ { top: 6, bottom: 6, left: 4, right: 4 } }
      >
        { ({ isFocused }) => (
          <ThemedText
            style={ [
              styles.tabText,
              isActive && styles.tabTextActive,
              isFocused && styles.tabTextFocused,
            ] }
          >
            { displayTitle || title }
          </ThemedText>
        ) }
      </ThemedPressable>

      { sorting && (
        <ThemedDropdown
          overlayRef={ sortingOverlayRef }
          data={ sorting }
          value={ selectedSorting?.[id]?.value ?? sorting[0]?.value ?? '' }
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
  activeIndex,
  menuTrailingComponent,
  onTabSelect,
  handleSelectSorting,
}: Pick<
  FilmPagerComponentProps,
  | 'pagerItems'
  | 'sorting'
  | 'selectedSorting'
  | 'menuDefaultFocus'
  | 'menuTrailingComponent'
  | 'handleSelectSorting'
> & {
  activeIndex: number;
  onTabSelect: (index: number) => void;
  styles: ThemedStyles<typeof componentStyles>;
}) => {
  const menuId = useMemo(
    () => `atv-film-pager-${Math.random().toString(36).slice(2)}`,
    [],
  );

  const getTabFocusKey = useCallback(
    (menuItemId: string) => `${menuId}-tab-${menuItemId}`,
    [menuId],
  );

  const preferredChildFocusKey = pagerItems[activeIndex]
    ? getTabFocusKey(pagerItems[activeIndex].menuItem.id)
    : undefined;

  return (
    <View style={ styles.menuRow }>
      <View style={ styles.menuListContainer }>
        <ThemedScrollView
          horizontal
          containerStyle={ styles.menuListWrapper }
          style={ styles.menuList }
          autofocus={ menuDefaultFocus }
          preferredChildFocusKey={ preferredChildFocusKey }
        >
          { pagerItems.map((item, idx) => (
            <TabButton
              key={ item.menuItem.id }
              menuItem={ item.menuItem }

              displayTitle={ item.displayTitle }
              isActive={ activeIndex === idx }
              focusKey={ getTabFocusKey(item.menuItem.id) }
              onPress={ () => onTabSelect(idx) }
              onFocus={ () => onTabSelect(idx) }
              styles={ styles }
              sorting={ sorting }
              selectedSorting={ selectedSorting }
              handleSelectSorting={ handleSelectSorting }
            />
          )) }
        </ThemedScrollView>
      </View>

      { menuTrailingComponent && (
        <View style={ styles.menuTrailing }>
          { menuTrailingComponent }
        </View>
      ) }
    </View>
  );
});

export function FilmPagerComponent({
  pagerItems,
  renderPageContent,
  displayMode,
  disableEmptyComponent,
  isEmpty,
  hideGrid,
  disableStatusbarSafeArea,
  ListEmptyComponent,
  centerEmptyComponent,
  sorting,
  selectedSorting,
  initialPage = 0,
  menuDefaultFocus,
  menuTrailingComponent,
  tabPosition = 'bottom',
  onPreLoad,
  onNextLoad,
  handleSelectSorting,
  showScrollToTopButton,
}: FilmPagerComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { AnimatedPagerView, ref: pagerViewRef } = usePagerView({ pagesAmount: 10 });

  const [activeIndex, setActiveIndex] = useState(initialPage);

  const scrollState = useRef<'idle' | 'dragging' | 'settling'>('idle');

  const tabsKey = pagerItems
    .map(({ menuItem }) => menuItem.id)
    .join('|');

  const [renderedTabs, setRenderedTabs] = useState<TabsState>(() => ({
    key: tabsKey,
    indexes: new Set([initialPage]),
  }));

  const loadedTabsRef = useRef<TabsState>({
    key: tabsKey,
    indexes: new Set([initialPage]),
  });

  const renderedIndexes =
    renderedTabs.key === tabsKey
      ? renderedTabs.indexes
      : EMPTY_INDEXES;

  const preloadTab = useCallback((index: number) => {
    const item = pagerItems[index];
    if (!item) return;
    if (loadedTabsRef.current.key !== tabsKey) {
      loadedTabsRef.current = { key: tabsKey, indexes: new Set([initialPage]) };
    }
    if (index === initialPage || loadedTabsRef.current.indexes.has(index)) return;
    loadedTabsRef.current.indexes.add(index);
    onPreLoad(item);
  }, [pagerItems, tabsKey, initialPage, onPreLoad]);

  const updateActiveTab = useCallback((index: number) => {
    preloadTab(index);
    if (index < 0 || index >= pagerItems.length) {
      return;
    }

    setActiveIndex(index);

    setRenderedTabs((prev) => {
      const isCurrent = prev.key === tabsKey;

      if (isCurrent && prev.indexes.has(index)) {
        return prev;
      }

      const indexes = new Set(isCurrent ? prev.indexes : []);
      indexes.add(index);

      return {
        key: tabsKey,
        indexes,
      };
    });
  }, [pagerItems.length, tabsKey, preloadTab]);

  const handleTabSelect = useCallback((index: number) => {
    if (index === activeIndex) {
      return;
    }

    pagerViewRef.current?.setPage(index);
    updateActiveTab(index);
  }, [activeIndex, pagerViewRef, updateActiveTab]);

  const handlePageSelect = useCallback((
    event: NativeSyntheticEvent<OnPageSelectedEventData>,
  ) => {
    const { position } = event.nativeEvent;

    updateActiveTab(position);
  }, [updateActiveTab]);

  const handlePageScroll = useCallback((
    event: NativeSyntheticEvent<OnPageScrollEventData>,
  ) => {
    const { offset, position } = event.nativeEvent;

    if (scrollState.current !== 'dragging') {
      return;
    }

    if (position === activeIndex) {
      updateActiveTab(offset >= 0.5 ? activeIndex + 1 : activeIndex);
      return;
    }

    updateActiveTab(offset <= 0.5 ? activeIndex - 1 : activeIndex);
  }, [activeIndex, updateActiveTab]);

  const handlePageScrollStateChanged = useCallback((
    event: NativeSyntheticEvent<OnPageScrollStateChangedEventData>,
  ) => {
    scrollState.current = event.nativeEvent.pageScrollState;
  }, []);

  const renderPage = useCallback((pagerItem: PagerItemInterface, idx: number) => {
    if (!renderedIndexes.has(idx) && idx !== initialPage) {
      return null;
    }

    if (renderPageContent) return renderPageContent(pagerItem, idx, idx === activeIndex);
    const { films, pagination } = pagerItem;
    const filmItems = (films ?? []).map((film) => ({ film }));

    if (displayMode === 'list') {
      return (
        <FilmList
          items={ filmItems }
          ListEmptyComponent={ ListEmptyComponent }
          onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItem) }
        />
      );
    }

    return (
      <FilmGrid
        films={ films ?? [] }
        hasMorePages={ pagination.currentPage < pagination.totalPages }
        disableEmptyComponent={ disableEmptyComponent }
        disableStatusbarSafeArea={ disableStatusbarSafeArea }
        isEmpty={ isEmpty && films !== null && !films.length }
        hideGrid={ hideGrid }
        ListEmptyComponent={ ListEmptyComponent }
        centerEmptyComponent={ centerEmptyComponent }
        onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItem) }
        showScrollToTopButton={ showScrollToTopButton }
      />
    );
  }, [
    centerEmptyComponent,
    displayMode,
    disableEmptyComponent,
    disableStatusbarSafeArea,
    hideGrid,
    initialPage,
    isEmpty,
    ListEmptyComponent,
    onNextLoad,
    renderPageContent,
    activeIndex,
    renderedIndexes,
    showScrollToTopButton,
  ]);

  const pages = useMemo(() => pagerItems.map((item, idx) => (
    <View
      key={ item.menuItem.id }
      style={ styles.page }
    >
      { renderPage(item, idx) }
    </View>
  )), [pagerItems, renderPage, styles.page]);

  return (
    <View style={ styles.container }>
      { tabPosition === 'top' && pagerItems.length > 1 && (
        <TopMenu
          pagerItems={ pagerItems }
          styles={ styles }
          sorting={ sorting }
          selectedSorting={ selectedSorting }
          menuDefaultFocus={ menuDefaultFocus }
          activeIndex={ activeIndex }
          menuTrailingComponent={ menuTrailingComponent }
          onTabSelect={ handleTabSelect }
          handleSelectSorting={ handleSelectSorting }
        />
      ) }

      <AnimatedPagerView
        ref={ pagerViewRef }
        style={ styles.pager }
        initialPage={ initialPage }
        onPageScroll={ handlePageScroll }
        onPageSelected={ handlePageSelect }
        onPageScrollStateChanged={ handlePageScrollStateChanged }
        pageMargin={ scale(0) }
      >
        { pages }
      </AnimatedPagerView>

      { tabPosition === 'bottom' && pagerItems.length > 1 && (
        <TopMenu
          pagerItems={ pagerItems }
          styles={ styles }
          sorting={ sorting }
          selectedSorting={ selectedSorting }
          menuDefaultFocus={ menuDefaultFocus }
          activeIndex={ activeIndex }
          menuTrailingComponent={ menuTrailingComponent }
          onTabSelect={ handleTabSelect }
          handleSelectSorting={ handleSelectSorting }
        />
      ) }
    </View>
  );
}

export default FilmPagerComponent;
