import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationRoot,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NavigationStore from 'Store/Navigation.store';
import { TVEventType } from 'Type/TVEvent.type';
import { scale } from 'Util/CreateStyles';
import { DEFAULT_TAB, Tab, TABS, TABS_TV } from './NavigationBar.config';
import { styles } from './NavigationBar.style.atv';

export function NavigationBarComponent() {
  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);
  const isOpened = useSharedValue<boolean>(NavigationStore.isNavigationOpened);

  const animatedOpeningStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isOpened.value ? styles.tabsOpened.width : styles.tabs.width, {
        duration: 500,
      }),
    };
  });

  const animatedTabText = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isOpened.value ? styles.tabTextOpened.opacity : styles.tabText.opacity, {
        duration: 500,
      }),
    };
  });

  useEffect(() => {
    isOpened.value = NavigationStore.isNavigationOpened;
  });

  const onDirectionHandledWithoutMovement = (movement: string) => {
    if (movement === TVEventType.Right) {
      NavigationStore.closeNavigation();
    }
  };

  const onFocus = (tab: Tab) => {
    const { id, route } = tab;

    setSelectedTab(id);
    setTimeout(() => {
      router.replace(route);
    });
  };

  const renderTab = (tab: Tab, idx: number) => {
    const { id, name, icon } = tab;

    return (
      <SpatialNavigationFocusableView
        key={id}
        onFocus={() => onFocus(tab)}
      >
        {({ isRootActive }) => (
          <View
            style={[
              styles.tab,
              selectedTab === id && !isRootActive && styles.tabSelected,
              selectedTab === id && isRootActive && styles.tabFocused,
            ]}
          >
            <ThemedIcon
              style={[
                styles.tabIcon,
                selectedTab === id && isRootActive && styles.tabContentFocused,
              ]}
              icon={icon}
              size={scale(24)}
              color="white"
            />
            <ThemedText
              style={[
                styles.tabText,
                selectedTab === id && isRootActive && styles.tabContentFocused,
                animatedTabText,
              ]}
              useAnimation
            >
              {name}
            </ThemedText>
          </View>
        )}
      </SpatialNavigationFocusableView>
    );
  };

  const renderTabs = () => {
    return TABS.concat(TABS_TV).map((tab, idx) => renderTab(tab, idx));
  };

  if (!NavigationStore.isNavigationVisible) {
    return null;
  }

  return (
    <SpatialNavigationRoot
      isActive={NavigationStore.isNavigationOpened}
      onDirectionHandledWithoutMovement={onDirectionHandledWithoutMovement}
    >
      <ThemedView style={styles.bar}>
        <SpatialNavigationView direction="vertical">
          <DefaultFocus>
            <ThemedView
              style={[styles.tabs, animatedOpeningStyle]}
              useAnimation
            >
              {renderTabs()}
            </ThemedView>
          </DefaultFocus>
        </SpatialNavigationView>
        <LinearGradient
          style={[
            styles.barBackground,
            NavigationStore.isNavigationOpened && styles.barBackgroundOpened,
          ]}
          colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </ThemedView>
    </SpatialNavigationRoot>
  );
}

export default observer(NavigationBarComponent);
