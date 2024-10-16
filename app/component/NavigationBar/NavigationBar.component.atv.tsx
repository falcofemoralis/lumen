import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { router } from 'expo-router';
import React, { createRef, useRef, useState } from 'react';
import { Pressable, TVFocusGuideView, useTVEventHandler } from 'react-native';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { scale } from 'Util/CreateStyles';
import { DEFAULT_TAB, Tab, TABS, TabType } from './NavigationBar.config';
import { styles } from './NavigationBar.style';

export function NavigationBarComponent() {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>(DEFAULT_TAB);
  const elementsRef = useRef(TABS.map(() => createRef()));

  useTVEventHandler((evt: any) => {
    const type = evt.eventType;

    if (type === 'right' && isOpened) {
      setIsOpened(false);
    }
  });

  const onFocus = (tab: Tab) => {
    const { id, route } = tab;

    if (id !== selectedTab) {
      setSelectedTab(id);
      router.replace(route);
    }

    if (!isOpened) {
      setIsOpened(true);
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

  return (
    // @ts-ignore
    <TVFocusGuideView trapFocusLeft trapFocusUp trapFocusDown destinations={[getCurrentRef()]}>
      <ThemedView style={[styles.container, animatedOpening]} useAnimations>
        {renderTabs()}
      </ThemedView>
    </TVFocusGuideView>
  );
}

export default NavigationBarComponent;
