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

import { LinkingOptions } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { services } from 'Api/services';
import { Awake } from 'Component/Awake';
import { Root } from 'Component/Root';
import { AppProvider } from 'Context/AppContext';
import { DEFAULT_SERVICE } from 'Context/ServiceContext';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from 'Navigation/AppNavigator';
import { NativeFocusTrap } from 'Navigation/NativeFocusTrap';
import { AppStackParamList } from 'Navigation/navigationTypes';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'Theme/context';
import { createQueryClient } from 'Util/Query';

import { initI18n } from './i18n';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

SplashScreen.setOptions({
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

export function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n().then(() => setIsI18nInitialized(true));
  }, []);

  if (!isI18nInitialized) {
    return null;
  }

  const linking: LinkingOptions<AppStackParamList> = {
    prefixes: [
      Linking.createURL('/'),
      services[DEFAULT_SERVICE].officialMirror,
      ...services[DEFAULT_SERVICE].defaultProviders,
    ],
    config: {
      screens: {
        Tabs: {
          screens: {
            'Home-tab': {
              screens: {
                Film: {
                  path: '*',
                  parse: {
                    link: (_: string, url: string) => url,
                  },
                },
              },
            },
          },
        },
      },
    },
    filter: (url: string) => url.includes('.html'),
  };

  return (
    <QueryClientProvider client={ queryClient }>
      <SafeAreaProvider initialMetrics={ initialWindowMetrics }>
        <KeyboardProvider>
          <AppProvider>
            <ThemeProvider>
              <GestureHandlerRootView>
                <Root>
                  <Awake>
                    <NativeFocusTrap />
                    <AppNavigator
                      linking={ linking }
                      onReady={ () => {
                        SplashScreen.hideAsync();
                      } }
                    />
                  </Awake>
                </Root>
              </GestureHandlerRootView>
            </ThemeProvider>
          </AppProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
