import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { View } from 'react-native';
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
import { FocusedTabAnimation, OpeningAnimation, styles } from './NavigationBar.style.atv';

export function NavigationBarComponent() {
  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);

  const onDirectionHandledWithoutMovement = (movement: string) => {
    if (movement === TVEventType.Right) {
      NavigationStore.closeNavigation();
    }
  };

  const onFocus = (tab: Tab) => {
    const { id, route } = tab;

    if (id === selectedTab) {
      return;
    }

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
          <FocusedTabAnimation isOpened={NavigationStore.isNavigationOpened}>
            {({ animatedTextStyle }) => (
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
                <ThemedText.Animated
                  style={[
                    styles.tabText,
                    selectedTab === id && isRootActive && styles.tabContentFocused,
                    animatedTextStyle,
                  ]}
                >
                  {name}
                </ThemedText.Animated>
              </View>
            )}
          </FocusedTabAnimation>
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
            <OpeningAnimation isOpened={NavigationStore.isNavigationOpened}>
              {({ animatedOpeningStyle }) => (
                <ThemedView.Animated style={[styles.tabs, animatedOpeningStyle]}>
                  {renderTabs()}
                </ThemedView.Animated>
              )}
            </OpeningAnimation>
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
