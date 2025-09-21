import { DarkTheme } from '@react-navigation/native';
import AppUpdater from 'Component/AppUpdater';
import Root from 'Component/Root';
import { Portal } from 'Component/ThemedPortal';
import { AppProvider } from 'Context/AppContext';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';

import { RootStack } from './navigation';
import { Navigation } from './navigation/container';

SplashScreen.setOptions({
  duration: 750,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider enabled={ false }>
        <Navigation
          theme={ DarkTheme }
          onReady={ () => {
            setTimeout(() => {
              SplashScreen.hideAsync();
            }, 250);
          } }
        >
          <AppProvider>
            <SpatialNavigationDeviceTypeProvider>
              <GestureHandlerRootView>
                <Root>
                  <Portal.Host>
                    { !ConfigStore.isTV() && <AppUpdater /> }
                    <RootStack />
                  </Portal.Host>
                  <StatusBar style="light" />
                </Root>
              </GestureHandlerRootView>
            </SpatialNavigationDeviceTypeProvider>
          </AppProvider>
        </Navigation>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
