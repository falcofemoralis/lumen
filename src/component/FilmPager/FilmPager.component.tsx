import FilmGrid from 'Component/FilmGrid';
import { useRef, useState } from 'react';
import { NativeSyntheticEvent, Pressable, ScrollView, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import {
  OnPageScrollEventData,
  OnPageScrollStateChangedEventData,
  OnPageSelectedEventData,
} from 'react-native-pager-view/lib/typescript/PagerViewNativeComponent';
import Animated from 'react-native-reanimated';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPager.style';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

export const FilmPagerComponent = ({
  pagerItems,
  onPreLoad,
  onNextLoad,
}: FilmPagerComponentProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [renderedTabs, setRenderedTabs] = useState<boolean[]>(Array(pagerItems.length + 1).fill(false));
  const scrollViewRef = useRef<ScrollView>(null);
  const pagerViewRef = useRef<PagerView>(null);
  const tabWidthsRef = useRef<number[]>([]);
  const loadedTabsRef = useRef<boolean[]>(Array(pagerItems.length + 1).fill(false));
  const scrollState = useRef<'idle' | 'dragging' | 'settling'>('idle');

  const updateActiveTab = (index: number) => {
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
  };

  const handleTabPress = (index: number) => {
    pagerViewRef.current?.setPage(index);
    updateActiveTab(index);
  };

  const handlePageSelect = (e: NativeSyntheticEvent<OnPageSelectedEventData>) => {
    const { position } = e.nativeEvent;

    setActiveIndex(position);

    if (!loadedTabsRef.current[position] && position !== 0) {
      onPreLoad(pagerItems[position]);
      loadedTabsRef.current[position] = true;
    }
  };

  const handlePageScroll = (e: NativeSyntheticEvent<OnPageScrollEventData>) => {
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
  };

  const handlePageScrollStateChanged = (e: NativeSyntheticEvent<OnPageScrollStateChangedEventData>) => {
    scrollState.current = e.nativeEvent.pageScrollState;
  };

  const renderScrollableTabBar = () => {
    return (
      <View>
        <ScrollView
          ref={ scrollViewRef }
          horizontal
          showsHorizontalScrollIndicator={ false }
          contentContainerStyle={ styles.tabBarContainer }
        >
          { pagerItems.map(({ key, title }, i) => (
            <Pressable
              key={ key }
              onPress={ () => handleTabPress(i) }
              style={ styles.tabButton }
              onLayout={ (e) => tabWidthsRef.current[i] = e.nativeEvent.layout.width }
            >
              <Animated.Text
                style={ [
                  styles.tabText,
                  activeTab === i && styles.activeTabText,
                ] }
              >
                { title }
              </Animated.Text>
            </Pressable>
          )) }
        </ScrollView>
      </View>
    );
  };

  const renderPage = (pagerItem: PagerItemInterface, idx: number) => {
    if (!renderedTabs[idx] && idx !== 0) {
      return null;
    }

    const { films } = pagerItem;

    return (
      <FilmGrid
        films={ films ?? [] }
        onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItem) }
      />
    );
  };

  const renderPagerView = () => {
    return (
      <PagerView
        ref={ pagerViewRef }
        style={ { flex: 1 } }
        initialPage={ 0 }
        onPageScroll={ handlePageScroll }
        onPageSelected={ handlePageSelect }
        onPageScrollStateChanged={ handlePageScrollStateChanged }
        pageMargin={ scale(24) }
      >
        { pagerItems.map((item, idx) => (
          <View key={ item.key }>
            { renderPage(item, idx) }
          </View>
        )) }
      </PagerView>
    );
  };

  if (!pagerItems.length) {
    return renderPage(pagerItems[0], 0);
  }

  return (
    <View style={ { flex: 1 } }>
      { renderPagerView() }
      { renderScrollableTabBar() }
    </View>
  );
};

export default FilmPagerComponent;
