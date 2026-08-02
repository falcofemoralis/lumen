/* eslint-disable import/first */
import { LogBox } from 'react-native';

if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require('./devtools/ReactotronConfig.ts');
  require('./devtools/FetchInterceptor.ts');

  const IGNORED_LOGS = [
    'i18next is made possible by our own product',
    '`new NativeEventEmitter()`',
  ];

  LogBox.ignoreLogs(IGNORED_LOGS);

  const withoutIgnored = (logger: (...args: any[]) => void) => (...args: any[]) => {
    const output = args.join(' ');

    if (!IGNORED_LOGS.some(log => output.includes(log))) {
      logger(...args);
    }
  };

  console.log = withoutIgnored(console.log);
  console.info = withoutIgnored(console.info);
  console.warn = withoutIgnored(console.warn);
  console.error = withoutIgnored(console.error);
}

import { init } from '@noriginmedia/norigin-spatial-navigation-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { Root } from 'Component/Root';
import { AppProvider } from 'Context/AppContext';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from 'Navigation/AppNavigator';
import { NativeFocusTrap } from 'Navigation/NativeFocusTrap';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'Theme/context';
import { createQueryClient } from 'Util/Query';
import RemoteControlLayoutAdapter from 'Util/RemoteControl/RemoteControlLayoutAdapter';

import { initI18n } from './i18n';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

SplashScreen.setOptions({
  duration: 750,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

export function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n().then(() => setIsI18nInitialized(true));

    init({
      layoutAdapter: RemoteControlLayoutAdapter,
    });
  }, []);

  if (!isI18nInitialized) {
    return null;
  }

  return (
    <QueryClientProvider client={ queryClient }>
      <SafeAreaProvider initialMetrics={ initialWindowMetrics }>
        <KeyboardProvider>
          <AppProvider>
            <ThemeProvider>
              <GestureHandlerRootView>
                <Root>
                  <NativeFocusTrap />
                  <AppNavigator
                    onReady={ () => {
                      SplashScreen.hideAsync();
                    } }
                  />
                </Root>
              </GestureHandlerRootView>
            </ThemeProvider>
          </AppProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
