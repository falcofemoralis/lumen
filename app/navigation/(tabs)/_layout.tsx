import NavigationBar from 'Component/NavigationBar';
import { Slot } from 'expo-router';
import React from 'react';
import AppStore from 'Store/App.store';

export function TabLayout() {
  return AppStore.isTV ? <Slot /> : <NavigationBar />;
}

export default TabLayout;
