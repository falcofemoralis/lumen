/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
import { LogBox } from 'react-native';

if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require('./devtools/ReactotronConfig.ts');

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
import { services } from 'Api/services';
import { Awake } from 'Component/Awake';
import { Root } from 'Component/Root';
import { AppProvider } from 'Context/AppContext';
import { DEFAULT_SERVICE } from 'Context/ServiceContext';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from 'Navigation/AppNavigator';
import { AppStackParamList } from 'Navigation/navigationTypes';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'Theme/context';
import { useNavigationPersistence } from 'Util/Navigation';
import { configureRemoteControl } from 'Util/RemoteControl';

import { initI18n } from './i18n';
import { applyPatches } from './patch';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

SplashScreen.setOptions({
  duration: 750,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(NAVIGATION_PERSISTENCE_KEY);

  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    configureRemoteControl();
    applyPatches();

    initI18n().then(() => setIsI18nInitialized(true));
  }, []);

  if (!isNavigationStateRestored || !isI18nInitialized) {
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
    <SafeAreaProvider initialMetrics={ initialWindowMetrics }>
      <KeyboardProvider>
        <AppProvider>
          <ThemeProvider>
            <GestureHandlerRootView>
              <Root>
                <Awake>
                  <AppNavigator
                    linking={ linking }
                    initialState={ initialNavigationState }
                    onStateChange={ onNavigationStateChange }
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
  );
}
