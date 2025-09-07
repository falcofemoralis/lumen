import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import AppUpdater from 'Component/AppUpdater';
import Root from 'Component/Root';
import { Portal } from 'Component/ThemedPortal';
import { AppProvider } from 'Context/AppContext';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import { Colors } from 'Style/Colors';

import { RootStack } from './navigation';
import { Navigation } from './navigation/container';

SplashScreen.preventAutoHideAsync();

export function App() {
  return (
    <Navigation
      theme={ DarkTheme }
      onReady={ () => {
        SplashScreen.hideAsync();
      } }
    >
      <AppProvider>
        <SpatialNavigationDeviceTypeProvider>
          <GestureHandlerRootView>
            <Root>
              <SafeAreaView style={ { flex: 1, backgroundColor: Colors.background } }>
                <Portal.Host>
                  { !ConfigStore.isTV() && <AppUpdater /> }
                  <RootStack />
                </Portal.Host>
              </SafeAreaView>
            </Root>
          </GestureHandlerRootView>
        </SpatialNavigationDeviceTypeProvider>
      </AppProvider>
    </Navigation>
  );
}
