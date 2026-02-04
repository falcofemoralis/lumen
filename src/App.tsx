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
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require('./devtools/ReactotronConfig.ts');
}
import 'Util/GestureHandler/gestureHandler';

import { AppUpdater } from 'Component/AppUpdater';
import { Awake } from 'Component/Awake';
import { Root } from 'Component/Root';
import Portal from 'Component/ThemedPortal/Portal';
import { AppProvider } from 'Context/AppContext';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from 'Navigation/AppNavigator';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'Theme/context';
import { loadDateFnsLocale } from 'Util/Date';
import { useNavigationPersistence } from 'Util/Navigation';
import { configureRemoteControl } from 'Util/RemoteControl';

import { initI18n } from './i18n';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

// Web linking configuration
const prefix = Linking.createURL('/');
const config = {
  screens: {
    // Welcome: 'welcome',
    // Demo: {
    //   screens: {
    //     DemoShowroom: {
    //       path: 'showroom/:queryIndex?/:itemIndex?',
    //     },
    //     DemoDebug: 'debug',
    //     DemoPodcastList: 'podcast',
    //     DemoCommunity: 'community',
    //   },
    // },
  },
};

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
  } = useNavigationPersistence( NAVIGATION_PERSISTENCE_KEY);

  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    configureRemoteControl();

    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale());
  }, []);

  if (!isNavigationStateRestored || !isI18nInitialized) {
    return null;
  }

  const linking = {
    prefixes: [prefix],
    config,
  };

  return (
    <SafeAreaProvider initialMetrics={ initialWindowMetrics }>
      <KeyboardProvider>
        <AppProvider>
          <ThemeProvider>
            <GestureHandlerRootView>
              <Root>
                <Awake>
                  <Portal.Host>
                    <AppUpdater position='root' />
                    <AppNavigator
                      linking={ linking }
                      initialState={ initialNavigationState }
                      onStateChange={ onNavigationStateChange }
                      onReady={ () => {
                        SplashScreen.hideAsync();
                      } }
                    />
                  </Portal.Host>
                </Awake>
              </Root>
            </GestureHandlerRootView>
          </ThemeProvider>
        </AppProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
