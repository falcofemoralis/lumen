/* eslint-disable import/first */
if (__DEV__) {
  require('./devtools/ReactotronConfig.ts');
  require('./devtools/FetchInterceptor.ts');
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

/**
 * Shortest gap between two spatial-navigation moves. Roughly one move per four
 * frames -- fast enough to feel responsive when holding a direction, slow enough
 * that a low-end box can finish drawing one row before it is asked for the next.
 */
const KEY_THROTTLE_MS = 60;

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
      // A d-pad repeats far faster than a slow TV box can answer: every press
      // re-measures the focused node's siblings and drives a scroll, so an
      // unthrottled hold builds a backlog that keeps moving focus long after the
      // key is released. Norigin throttles leading-edge, so the first press is
      // still instant and the extra ones are dropped rather than queued.
      throttle: KEY_THROTTLE_MS,
      // Apply it to held keys too -- that is the case that produces the backlog.
      throttleKeypresses: true,
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
