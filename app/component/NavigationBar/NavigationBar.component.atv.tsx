import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
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

  const animatedOpening = useAnimatedStyle(() => {
    return {
      width: withTiming(isOpened.value ? styles.focusedContainer.width : styles.container.width, {
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
              selectedTab === id && !isRootActive && styles.activeTab,
              selectedTab === id && isRootActive && styles.focusedTab,
            ]}
          >
            <ThemedIcon
              style={styles.tabIcon}
              icon={icon}
              size={scale(24)}
              color="white"
            />
            {NavigationStore.isNavigationOpened && (
              <ThemedText style={styles.tabText}>{name}</ThemedText>
            )}
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
    <View>
      <SpatialNavigationRoot
        isActive={NavigationStore.isNavigationOpened}
        onDirectionHandledWithoutMovement={onDirectionHandledWithoutMovement}
      >
        <ThemedView
          style={[styles.container, animatedOpening]}
          useAnimation
        >
          <SpatialNavigationView direction="vertical">
            <DefaultFocus>{renderTabs()}</DefaultFocus>
          </SpatialNavigationView>
        </ThemedView>
      </SpatialNavigationRoot>
    </View>
  );
}

export default observer(NavigationBarComponent);
