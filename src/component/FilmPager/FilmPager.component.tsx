import { FilmGrid } from 'Component/FilmGrid';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
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
  isActive,
  onPress,
  onLayout,
  styles,
  sorting,
  selectedSorting,
  handleSelectSorting,
}: {
  menuItem: PagerItemInterface['menuItem'];
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
          { title }
        </Animated.Text>
        { sorting && isActive && (
          <Animated.Text
            style={ [
              styles.sortingText,
            ] }
          >
            { selectedSorting?.[id]?.label ?? sorting[0].label }
          </Animated.Text>
        ) }
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
  disableEmptyComponent,
  isEmpty,
  hideGrid,
  disableStatusbarSafeArea,
  ListEmptyComponent,
  centerEmptyComponent,
  sorting,
  selectedSorting,
  onPreLoad,
  onNextLoad,
  handleSelectSorting,
}: FilmPagerComponentProps) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { AnimatedPagerView, ref: pagerViewRef } = usePagerView({ pagesAmount: 10 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabWidthsRef = useRef<number[]>([]);
  const scrollState = useRef<'idle' | 'dragging' | 'settling'>('idle');

  // identifies the current set of tabs; pagerItems itself gets a new identity on every
  // render, so the ids are what tells an actual tab change from a films update
  const tabsKey = pagerItems.map(({ menuItem }) => menuItem.id).join('|');

  const [renderedTabs, setRenderedTabs] = useState<TabsState>(() => ({ key: tabsKey, indexes: new Set() }));
  const loadedTabsRef = useRef<TabsState>({ key: tabsKey, indexes: new Set() });

  // entries left over from a previous set of tabs are ignored on read, which keeps the
  // reset out of an effect and off the render path
  const renderedIndexes = renderedTabs.key === tabsKey ? renderedTabs.indexes : EMPTY_INDEXES;

  const updateActiveTab = useCallback((index: number) => {
    if (index !== activeTab) {
      setActiveTab(index);
      const offsetX = tabWidthsRef.current.slice(0, index).reduce((acc, width) => acc + width, 0);
      scrollViewRef.current?.scrollTo({ x: offsetX, animated: true });
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
  }, [activeTab, tabsKey]);

  const handleTabPress = useCallback((index: number) => {
    pagerViewRef.current?.setPage(index);
    updateActiveTab(index);
  }, [updateActiveTab, pagerViewRef]);

  const handlePageSelect = useCallback((e: NativeSyntheticEvent<OnPageSelectedEventData>) => {
    const { position } = e.nativeEvent;

    setActiveIndex(position);
    updateActiveTab(position);

    if (loadedTabsRef.current.key !== tabsKey) {
      loadedTabsRef.current = { key: tabsKey, indexes: new Set() };
    }

    const { indexes } = loadedTabsRef.current;

    if (!indexes.has(position) && position !== 0) {
      onPreLoad(pagerItems[position]);
      indexes.add(position);
    }
  }, [onPreLoad, pagerItems, updateActiveTab, tabsKey]);

  const handlePageScroll = useCallback((e: NativeSyntheticEvent<OnPageScrollEventData>) => {
    const { offset, position } = e.nativeEvent;

    if (scrollState.current !== 'dragging') {
      return;
    }

    if (position === activeIndex) {
      if (offset >= 0.5) {
        updateActiveTab(activeIndex + 1);
      } else {
        updateActiveTab(activeIndex);
      }
    } else {
      if (offset <= 0.5) {
        updateActiveTab(activeIndex - 1);
      } else {
        updateActiveTab(activeIndex);
      }
    }
  }, [activeIndex, updateActiveTab]);

  const handlePageScrollStateChanged = useCallback((e: NativeSyntheticEvent<OnPageScrollStateChangedEventData>) => {
    scrollState.current = e.nativeEvent.pageScrollState;
  }, []);

  const renderScrollableTabBar = useMemo(() => (
    <Wrapper>
      <ScrollView
        ref={ scrollViewRef }
        horizontal
        showsHorizontalScrollIndicator={ false }
        showsVerticalScrollIndicator={ false }
        contentContainerStyle={ styles.tabBarContainer }
        accessibilityRole="tablist"
      >
        { pagerItems.map(({ menuItem }, i) => (
          <TabButton
            key={ menuItem.id }
            menuItem={ menuItem }
            isActive={ activeTab === i }
            onPress={ () => handleTabPress(i) }
            onLayout={ (width) => tabWidthsRef.current[i] = width }
            styles={ styles }
            sorting={ sorting }
            selectedSorting={ selectedSorting }
            handleSelectSorting={ handleSelectSorting }
          />
        )) }
      </ScrollView>
    </Wrapper>
  ), [styles, pagerItems, activeTab, sorting, selectedSorting, handleSelectSorting, handleTabPress]);

  const renderPage = useCallback((pagerItem: PagerItemInterface, idx: number) => {
    if (!renderedIndexes.has(idx) && idx !== 0) {
      return null;
    }

    const { films } = pagerItem;

    return (
      <FilmGrid
        films={ films ?? [] }
        disableEmptyComponent={ disableEmptyComponent }
        disableStatusbarSafeArea={ disableStatusbarSafeArea }
        // empty flag it true, films array exist and this array is empty
        isEmpty={ isEmpty && films !== null && !films.length }
        hideGrid={ hideGrid }
        ListEmptyComponent={ ListEmptyComponent }
        centerEmptyComponent={ centerEmptyComponent }
        onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItem) }
      />
    );
  // eslint-disable-next-line max-len
  }, [renderedIndexes, disableEmptyComponent, disableStatusbarSafeArea, isEmpty, hideGrid, ListEmptyComponent, centerEmptyComponent, onNextLoad]);

  const pages = useMemo(() => (pagerItems).map((item, idx) => (
    <Wrapper key={ item.menuItem.id }>
      { renderPage(item, idx) }
    </Wrapper>
  )), [pagerItems, renderPage]);

  const renderPagerView = useMemo(() => (
    <AnimatedPagerView
      ref={ pagerViewRef }
      style={ { flex: 1, backgroundColor: theme.colors.background } }
      initialPage={ 0 }
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
    pages,
    scale,
    theme,
  ]);

  return (
    <View style={ { flex: 1 } }>
      { renderPagerView }
      { pagerItems.length > 1 && renderScrollableTabBar }
    </View>
  );
};

export default FilmPagerComponent;
