import { init, type LayoutAdapter } from '@noriginmedia/norigin-spatial-navigation-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { Root } from 'Component/Root';
import { AppProvider } from 'Context/AppContext';
import * as SplashScreen from 'expo-splash-screen';
import { useLanguageReload } from 'Hooks/useLanguageReload';
import { AppNavigator } from 'Navigation/AppNavigator';
import { NativeFocusTrap } from 'Navigation/NativeFocusTrap';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'Theme/context';
import { createQueryClient } from 'Util/Query';
import RemoteControlLayoutAdapter from './util/RemoteControl/RemoteControlLayoutAdapter.web';

import { initI18n } from './i18n';
import { useEffect } from 'react';
import { navigationRef, push } from 'Util/Navigation';
import { queryKeys } from 'Util/Query';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

/**
 * Shortest gap between two spatial-navigation moves. Roughly one move per four
 * frames -- fast enough to feel responsive when holding a direction, slow enough
 * that a low-end box can finish drawing one row before it is asked for the next.
 */
const KEY_THROTTLE_MS = 60;

SplashScreen.setOptions({
  duration: 250,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

// i18next only defers its load when it has to ask a backend -- with the resources
// passed inline it is initialized by the time the call returns. Doing it here rather
// than from an effect keeps the whole provider tree off a second render pass, and
// removes the window in which `t()` (used while the navigators render) would still
// be falling back to raw keys.
initI18n();

init({
  // Native package declarations augment the node type; Windows uses actual DOM nodes.
  layoutAdapter: RemoteControlLayoutAdapter as unknown as new (...args: any[]) => LayoutAdapter,
  // A d-pad repeats far faster than a slow TV box can answer: every press
  // re-measures the focused node's siblings and drives a scroll, so an
  // unthrottled hold builds a backlog that keeps moving focus long after the
  // key is released. Norigin throttles leading-edge, so the first press is
  // still instant and the extra ones are dropped rather than queued.
  throttle: KEY_THROTTLE_MS,
  // Apply it to held keys too -- that is the case that produces the backlog.
  throttleKeypresses: true,
});

export function App() {
  const { language, navigationState } = useLanguageReload();
  useEffect(() => {
    const back = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || document.body.classList.contains('lumen-fullscreen') || document.body.classList.contains('lumen-mini')) return;
      if (navigationRef.isReady() && navigationRef.canGoBack()) {
        event.preventDefault(); event.stopImmediatePropagation(); navigationRef.goBack();
      }
    };
    document.addEventListener('keydown', back);
    return () => document.removeEventListener('keydown', back);
  }, []);

  return (
    <QueryClientProvider client={ queryClient }>
      <SafeAreaProvider initialMetrics={ initialWindowMetrics }>
        <KeyboardProvider>
          <AppProvider>
            <ThemeProvider>
              <GestureHandlerRootView>
                <Root>
                  <NativeFocusTrap />
                  { /* keyed on the language so a change remounts the screens - see useLanguageReload */ }
                  <AppNavigator
                    key={ language }
                    initialState={ navigationState }
                    onStateChange={ () => {
                      document.body.classList.toggle('lumen-details', String(navigationRef.getCurrentRoute()?.name) === 'Film');
                    } }
                    onReady={ () => {
                      document.body.classList.toggle('lumen-details', String(navigationRef.getCurrentRoute()?.name) === 'Film');
                      const desktop = window as typeof window & {
                        lumen?: { diagnostic?: boolean };
                        lumenDiagnostics: { previewFilm?: (film: any) => void };
                      };
                      if (desktop.lumen?.diagnostic) desktop.lumenDiagnostics.previewFilm = (film: any) => {
                        queryClient.setQueryDefaults(queryKeys.film(film.link), { staleTime: Infinity });
                        queryClient.setQueryData(queryKeys.film(film.link), film);
                        push('Film', { link: film.link });
                      };
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
