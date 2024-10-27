import NavigationBar from 'Component/NavigationBar';
import ThemedView from 'Component/ThemedView';
import { Slot } from 'expo-router';
import React from 'react';
import AppStore from 'Store/App.store';

export default function TabLayout() {
  const renderTVLayout = () => (
    <ThemedView style={{ flex: 1, flexDirection: 'row' }}>
      <NavigationBar />
      <Slot />
    </ThemedView>
  );

  const renderMobileLayout = () => <NavigationBar />;

  return AppStore.isTV ? renderTVLayout() : renderMobileLayout();
}
