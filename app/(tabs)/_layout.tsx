import NavigationBar from 'Component/NavigationBar';
import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import ThemedView from 'Component/ThemedView';
import { Slot } from 'expo-router';
import React from 'react';
import { Dimensions, View } from 'react-native';
import AppStore from 'Store/App.store';

export default function TabLayout() {
  const windowWidth = Dimensions.get('window').width;

  const renderTVLayout = () => (
    <ThemedView style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
      <NavigationBar />
      <View style={{ width: windowWidth - NAVIGATION_BAR_TV_WIDTH }}>
        <Slot />
      </View>
    </ThemedView>
  );

  const renderMobileLayout = () => <NavigationBar />;

  if (!AppStore.isNavigationVisible) {
    return <Slot />;
  }

  return AppStore.isTV ? renderTVLayout() : renderMobileLayout();
}
