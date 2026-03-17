import { FilmGrid } from 'Component/FilmGrid';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeSyntheticEvent, ScrollView, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { usePagerView } from 'react-native-pager-view';
import {
  OnPageScrollEventData,
  OnPageScrollStateChangedEventData,
  OnPageSelectedEventData,
} from 'react-native-pager-view/lib/typescript/PagerViewNativeComponent';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './FilmPager.style';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

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
  items,
  isAddSafeArea,
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
  const [renderedTabs, setRenderedTabs] = useState<boolean[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabWidthsRef = useRef<number[]>([]);
  const loadedTabsRef = useRef<boolean[]>([]);
  const scrollState = useRef<'idle' | 'dragging' | 'settling'>('idle');
  const pagerItems = useMemo(() => Object.values(items), [items]);

  // Initialize arrays when pagerItems changes
  useEffect(() => {
    const length = pagerItems.length;
    setRenderedTabs(Array(length).fill(false));
    loadedTabsRef.current = Array(length).fill(false);
  }, [pagerItems.length]);

  const updateActiveTab = useCallback((index: number) => {
    if (index !== activeTab) {
      setActiveTab(index);
      const offsetX = tabWidthsRef.current.slice(0, index).reduce((acc, width) => acc + width, 0);
      scrollViewRef.current?.scrollTo({ x: offsetX, animated: true });
    }

    if (!renderedTabs[index]) {
      setRenderedTabs((prev) => {
        const newLoadedTabs = [...prev];
        newLoadedTabs[index] = true;

        return newLoadedTabs;
      });
    }
  }, [activeTab, renderedTabs]);

  const handleTabPress = useCallback((index: number) => {
    pagerViewRef.current?.setPage(index);
    updateActiveTab(index);
  }, [updateActiveTab]);

  const handlePageSelect = useCallback((e: NativeSyntheticEvent<OnPageSelectedEventData>) => {
    const { position } = e.nativeEvent;

    setActiveIndex(position);
    updateActiveTab(position);

    if (!loadedTabsRef.current[position] && position !== 0) {
      onPreLoad(pagerItems[position]);
      loadedTabsRef.current[position] = true;
    }
  }, [onPreLoad, pagerItems, updateActiveTab]);

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
    if (!renderedTabs[idx] && idx !== 0) {
      return null;
    }

    const { films } = pagerItem;

    return (
      <FilmGrid
        films={ films ?? [] }
        isAddSafeArea={ isAddSafeArea }
        onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItem) }
      />
    );
  }, [renderedTabs, isAddSafeArea, onNextLoad]);

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
