import NavigationBar from 'Component/NavigationBar';
import { Slot } from 'expo-router';
import React from 'react';
import ConfigStore from 'Store/Config.store';

export function TabLayout() {
  return ConfigStore.isTV ? <Slot /> : <NavigationBar />;
}

export default TabLayout;
