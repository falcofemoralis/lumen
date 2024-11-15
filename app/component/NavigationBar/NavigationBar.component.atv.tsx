import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { router, Slot } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { createRef, useRef, useState } from 'react';
import {
  Dimensions,
  HWEvent,
  Pressable,
  TVFocusGuideView,
  useTVEventHandler,
  View,
  findNodeHandle,
} from 'react-native';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import NavigationStore from 'Store/Navigation.store';
import { TVEventType } from 'Type/TVEvent.type';
import { scale } from 'Util/CreateStyles';
import { DEFAULT_TAB, Tab, TABS, TabType } from './NavigationBar.config';
import { NAVIGATION_BAR_TV_WIDTH, styles } from './NavigationBar.style.atv';

export function NavigationBarComponent() {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>(DEFAULT_TAB);
  const elementsRef = useRef(TABS.map(() => createRef()));
  const windowWidth = Dimensions.get('window').width;

  useTVEventHandler((evt: HWEvent) => {
    const { eventType: type, tag } = evt;

    if (type === TVEventType.Right && isOpened) {
      setIsOpened(false);
      NavigationStore.isNavigationOpened = false;
    }

    if (
      type === TVEventType.Left &&
      tag === findNodeHandle(getCurrentRef() as number | null) &&
      !isOpened
    ) {
      setIsOpened(true);
      NavigationStore.isNavigationOpened = true;
    }
  });

  const onFocus = (tab: Tab) => {
    const { id, route } = tab;

    if (id !== selectedTab) {
      setSelectedTab(id);
      router.replace(route);
    }
  };

  const animatedOpening = useAnimatedStyle(() => {
    return {
      width: withTiming(isOpened ? styles.focusedContainer.width : styles.container.width, {
        duration: 500,
      }),
    };
  });

  const getCurrentRef = () => {
    const idx = TABS.findIndex((tab) => tab.id === selectedTab);

    return elementsRef.current[idx].current;
  };

  const renderTab = (tab: Tab, idx: number) => {
    const { id, name, icon } = tab;

    return (
      <Pressable
        key={id}
        onFocus={() => onFocus(tab)}
        style={[
          styles.tab,
          selectedTab === id && !isOpened && styles.activeTab,
          selectedTab === id && isOpened && styles.focusedTab,
        ]}
        // @ts-ignore
        ref={elementsRef.current[idx]}
      >
        <MaterialCommunityIcons
          style={styles.tabIcon}
          // @ts-ignore
          name={icon}
          size={scale(24)}
          color="white"
        />
        {/* {isOpened && <ThemedText style={styles.tabText}>{name}</ThemedText>} */}
        <ThemedText style={styles.tabText}>{name}</ThemedText>
      </Pressable>
    );
  };

  const renderTabs = () => {
    return TABS.map((tab, idx) => renderTab(tab, idx));
  };

  const renderBar = () => {
    if (!NavigationStore.isNavigationVisible) {
      return null;
    }

    return (
      <TVFocusGuideView
        trapFocusLeft
        trapFocusUp
        trapFocusDown
        // @ts-ignore
        destinations={[getCurrentRef()]}
      >
        <ThemedView
          style={[styles.container, animatedOpening]}
          useAnimations
        >
          {renderTabs()}
        </ThemedView>
      </TVFocusGuideView>
    );
  };

  const renderPageContent = () => {
    const width = NavigationStore.isNavigationVisible
      ? windowWidth - NAVIGATION_BAR_TV_WIDTH
      : windowWidth;

    return (
      <View style={{ width }}>
        <Slot />
      </View>
    );
  };

  return (
    <ThemedView style={styles.layout}>
      {renderBar()}
      {renderPageContent()}
    </ThemedView>
  );
}

export default observer(NavigationBarComponent);
