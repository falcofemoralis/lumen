import { FilmGrid } from 'Component/FilmGrid';
import { FilmList } from 'Component/FilmList';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeSyntheticEvent, ScrollView, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { usePagerView } from 'react-native-pager-view';
import {
  OnPageScrollEventData,
  OnPageScrollStateChangedEventData,
  OnPageSelectedEventData,
} from 'react-native-pager-view/lib/typescript/PagerViewNativeComponent';
import Animated from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './FilmPager.style';
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
  onPress,
  onLayout,
  styles,
  sorting,
  selectedSorting,
  handleSelectSorting,
}: {
  menuItem: PagerItemInterface['menuItem'];
  displayTitle?: string;
  isActive: boolean;
  onPress: () => void;
  onLayout: (width: number) => void;
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
      <Pressable
        onPress={ handlePress }
        style={ styles.tabButton }
        onLayout={ (e) => onLayout(e.nativeEvent.layout.width) }
        accessibilityRole="tab"
        accessibilityState={ { selected: isActive } }
      >
        <Animated.Text
          style={ [
            styles.tabText,
            isActive && styles.activeTabText,
          ] }
        >
          { displayTitle ?? title }
        </Animated.Text>
      </Pressable>
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

export const FilmPagerComponent = ({
  pagerItems,
  displayMode,
  renderPageContent,
  disableEmptyComponent,
  isEmpty,
  hideGrid,
  disableStatusbarSafeArea,
  tabPosition = 'bottom',
  TabBarActionComponent,
  tabBarRightPadding,
  ListEmptyComponent,
  centerEmptyComponent,
  sorting,
  selectedSorting,
  initialPage = 0,
  onPreLoad,
  onNextLoad,
  handleSelectSorting,
  showScrollToTopButton,
}: FilmPagerComponentProps) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { top: safeAreaTop } = useSafeAreaInsets();
  const { AnimatedPagerView, ref: pagerViewRef } = usePagerView({ pagesAmount: 10 });
  const [activeIndex, setActiveIndex] = useState(initialPage);
  const [activeTab, setActiveTab] = useState(initialPage);
  const activeTabRef = useRef(initialPage);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabWidthsRef = useRef<number[]>([]);
  const scrollState = useRef<'idle' | 'dragging' | 'settling'>('idle');
  const isSwipingRef = useRef(false);
  // the tab bar starts scrolled to the initial tab, which can only happen once
  // the widths before it are measured
  const initialScrollDoneRef = useRef(initialPage === 0);

  // identifies the current set of tabs; pagerItems itself gets a new identity on every
  // render, so the ids are what tells an actual tab change from a films update
  const tabsKey = pagerItems.map(({ menuItem }) => menuItem.id).join('|');

  const [renderedTabs, setRenderedTabs] = useState<TabsState>(() => ({ key: tabsKey, indexes: new Set() }));
  const loadedTabsRef = useRef<TabsState>({ key: tabsKey, indexes: new Set() });

  // entries left over from a previous set of tabs are ignored on read, which keeps the
  // reset out of an effect and off the render path
  const renderedIndexes = renderedTabs.key === tabsKey ? renderedTabs.indexes : EMPTY_INDEXES;

  const getTabOffset = (index: number) => tabWidthsRef.current
    .slice(0, index)
    .reduce((acc, width) => acc + width, 0);

  const handleTabLayout = useCallback((index: number, width: number) => {
    tabWidthsRef.current[index] = width;

    if (initialScrollDoneRef.current) {
      return;
    }

    // every tab before the initial one has to be measured for the offset to be right
    for (let i = 0; i < initialPage; i++) {
      if (tabWidthsRef.current[i] === undefined) {
        return;
      }
    }

    initialScrollDoneRef.current = true;
    const offsetX = getTabOffset(initialPage);

    // the layout pass this runs in is the one sizing the content, so the scroll
    // has to wait for it or it clamps back to 0
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ x: offsetX, animated: false });
    });
  }, [initialPage]);

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
    if (index !== activeTabRef.current) {
      activeTabRef.current = index;
      setActiveTab(index);
      scrollViewRef.current?.scrollTo({ x: getTabOffset(index), animated: true });
    }

    setRenderedTabs((prev) => {
      const isCurrent = prev.key === tabsKey;

      if (isCurrent && prev.indexes.has(index)) {
        return prev;
      }

      const indexes = new Set(isCurrent ? prev.indexes : []);
      indexes.add(index);

      return { key: tabsKey, indexes };
    });
  }, [tabsKey, preloadTab]);

  const handleTabPress = useCallback((index: number) => {
    pagerViewRef.current?.setPage(index);
    updateActiveTab(index);
  }, [updateActiveTab, pagerViewRef]);

  const handlePageSelect = useCallback((e: NativeSyntheticEvent<OnPageSelectedEventData>) => {
    const { position } = e.nativeEvent;

    setActiveIndex(position);
    updateActiveTab(position);
  }, [updateActiveTab]);

  const handlePageScroll = useCallback((e: NativeSyntheticEvent<OnPageScrollEventData>) => {
    const { offset, position } = e.nativeEvent;

    if (!isSwipingRef.current || scrollState.current === 'idle' || !pagerItems.length) return;
    // Native position + offset works in both directions, including settling
    // after a quick swipe and returning to the original page after cancellation.
    const index = Math.max(0, Math.min(pagerItems.length - 1, Math.round(position + offset)));
    updateActiveTab(index);
  }, [pagerItems.length, updateActiveTab]);

  const handlePageScrollStateChanged = useCallback((e: NativeSyntheticEvent<OnPageScrollStateChangedEventData>) => {
    scrollState.current = e.nativeEvent.pageScrollState;
    if (scrollState.current === 'dragging') isSwipingRef.current = true;
    else if (scrollState.current === 'idle') isSwipingRef.current = false;
  }, []);

  const renderScrollableTabBar = useMemo(() => (
    <View
      style={ [
        styles.tabBarOuter,
        tabBarRightPadding !== undefined && { paddingRight: tabBarRightPadding },
        tabPosition === 'top' && { paddingTop: safeAreaTop },
      ] }
    >
      <Wrapper
        style={ tabBarRightPadding !== undefined && {
          marginRight: 0,
        } }
      >
        <View style={ styles.tabBarRow }>
          { pagerItems.length > 1 && (
            <ScrollView
              ref={ scrollViewRef }
              horizontal
              showsHorizontalScrollIndicator={ false }
              showsVerticalScrollIndicator={ false }
              style={ { flex: 1, minWidth: 0 } }
              contentContainerStyle={ styles.tabBarContainer }
              accessibilityRole="tablist"
            >
              { pagerItems.map(({ menuItem, displayTitle }, i) => (
                <TabButton
                  key={ menuItem.id }
                  menuItem={ menuItem }
                  displayTitle={ displayTitle }
                  isActive={ activeTab === i }
                  onPress={ () => handleTabPress(i) }
                  onLayout={ (width) => handleTabLayout(i, width) }
                  styles={ styles }
                  sorting={ sorting }
                  selectedSorting={ selectedSorting }
                  handleSelectSorting={ handleSelectSorting }
                />
              )) }
            </ScrollView>
          ) }
          { TabBarActionComponent && (
            <View style={ { flexShrink: 0 } }>
              { TabBarActionComponent }
            </View>
          ) }
        </View>
      </Wrapper>
    </View>
  ), [
    styles,
    pagerItems,
    activeTab,
    sorting,
    selectedSorting,
    handleSelectSorting,
    handleTabPress,
    handleTabLayout,
    TabBarActionComponent,
    tabPosition,
    safeAreaTop,
  ]);

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
        tabPosition={ tabPosition }
        isEmpty={ isEmpty && films !== null && !films.length }
        hideGrid={ hideGrid }
        ListEmptyComponent={ ListEmptyComponent }
        centerEmptyComponent={ centerEmptyComponent }
        onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItem) }
        showScrollToTopButton={ showScrollToTopButton && idx === activeIndex }
      />
    );
  // eslint-disable-next-line max-len
  }, [renderedIndexes, initialPage, renderPageContent, displayMode, disableEmptyComponent, disableStatusbarSafeArea, isEmpty, hideGrid, ListEmptyComponent, centerEmptyComponent, onNextLoad, showScrollToTopButton, activeIndex]);

  const pages = useMemo(() => (pagerItems).map((item, idx) => (
    <Wrapper key={ item.menuItem.id } style={ renderPageContent ? { flex: 1, minHeight: 0 } : undefined }>
      { renderPage(item, idx) }
    </Wrapper>
  )), [pagerItems, renderPage]);

  const renderPagerView = useMemo(() => (
    <AnimatedPagerView
      ref={ pagerViewRef }
      style={ { flex: 1, backgroundColor: theme.colors.background } }
      initialPage={ initialPage }
      onPageScroll={ handlePageScroll }
      onPageSelected={ handlePageSelect }
      onPageScrollStateChanged={ handlePageScrollStateChanged }
      pageMargin={ scale(24) }
    >
      { pages }
    </AnimatedPagerView>
  ), [
    AnimatedPagerView,
    pagerViewRef,
    handlePageScroll,
    handlePageSelect,
    handlePageScrollStateChanged,
    initialPage,
    pages,
    scale,
    theme,
  ]);

  const hasTabBarContent = pagerItems.length > 1 || Boolean(TabBarActionComponent);

  return (
    <View style={ { flex: 1 } }>
      { tabPosition === 'top' && hasTabBarContent && renderScrollableTabBar }
      { renderPagerView }
      { tabPosition === 'bottom' && hasTabBarContent && renderScrollableTabBar }
    </View>
  );
};

export default FilmPagerComponent;
