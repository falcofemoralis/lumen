import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, Slot } from 'expo-router';
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

import { Tab, TABS_TV_CONFIG } from './NavigationBar.config';
import { FocusedTabAnimation, OpeningAnimation, styles } from './NavigationBar.style.atv';

export function NavigationBarComponent() {
  const [selectedTab, setSelectedTab] = useState(
    TABS_TV_CONFIG.find((tab) => tab.isDefault)?.route ?? '',
  );

  const onDirectionHandledWithoutMovement = (movement: string) => {
    if (movement === TVEventType.Right) {
      NavigationStore.closeNavigation();
    }
  };

  const onFocus = (tab: Tab<Href>) => {
    const { route } = tab;

    if (route === selectedTab) {
      return;
    }

    setSelectedTab(route);
    setTimeout(() => {
      router.replace(route);
    });
  };

  const renderTab = (tab: Tab<Href>, idx: number) => {
    const { route, title, icon } = tab;

    return (
      <SpatialNavigationFocusableView
        key={ title }
        onFocus={ () => onFocus(tab) }
      >
        { ({ isRootActive }) => (
          <FocusedTabAnimation isOpened={ NavigationStore.isNavigationOpened }>
            { ({ animatedTextStyle }) => (
              <View
                style={ [
                  styles.tab,
                  selectedTab === route && !isRootActive && styles.tabSelected,
                  selectedTab === route && isRootActive && styles.tabFocused,
                ] }
              >
                { icon && (
                  <ThemedIcon
                    style={ [
                      styles.tabIcon,
                      selectedTab === route && isRootActive && styles.tabContentFocused,
                    ] }
                    icon={ icon }
                    size={ scale(24) }
                    color="white"
                  />
                ) }
                <ThemedText.Animated
                  style={ [
                    styles.tabText,
                    selectedTab === route && isRootActive && styles.tabContentFocused,
                    animatedTextStyle,
                  ] }
                >
                  { title }
                </ThemedText.Animated>
              </View>
            ) }
          </FocusedTabAnimation>
        ) }
      </SpatialNavigationFocusableView>
    );
  };

  const renderTabs = () => TABS_TV_CONFIG.map((tab, idx) => renderTab(tab, idx));

  if (!NavigationStore.isNavigationVisible) {
    return null;
  }

  return (
    <ThemedView style={ styles.layout }>
      <SpatialNavigationRoot
        isActive={ NavigationStore.isNavigationOpened }
        onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
      >
        <ThemedView style={ styles.bar }>
          <SpatialNavigationView direction="vertical">
            <DefaultFocus>
              <OpeningAnimation isOpened={ NavigationStore.isNavigationOpened }>
                { ({ animatedOpeningStyle }) => (
                  <ThemedView.Animated style={ [styles.tabs, animatedOpeningStyle] }>
                    { renderTabs() }
                  </ThemedView.Animated>
                ) }
              </OpeningAnimation>
            </DefaultFocus>
          </SpatialNavigationView>
          <LinearGradient
            style={ [
              styles.barBackground,
              NavigationStore.isNavigationOpened && styles.barBackgroundOpened,
            ] }
            colors={ ['rgba(0, 0, 0, 0.8)', 'transparent'] }
            start={ { x: 0.5, y: 0 } }
            end={ { x: 1, y: 0 } }
          />
        </ThemedView>
      </SpatialNavigationRoot>
      <View style={ [styles.slot, NavigationStore.isNavigationVisible && styles.slotBarVisible] }>
        <Slot />
      </View>
    </ThemedView>
  );
}

export default observer(NavigationBarComponent);