import {
  createContext,
  use,
  useMemo,
} from 'react';

import { AppUpdaterProvider } from './AppUpdaterContext';
import { NavigationProvider } from './NavigationContext';
import { OverlayProvider } from './OverlayContext';
import { PlayerProvider } from './PlayerContext';
import { ServiceProvider } from './ServiceContext';

interface AppContextInterface {
}

const AppContext = createContext<AppContextInterface>({
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useMemo(() => ({}), []);

  return (
    <AppContext.Provider value={ value }>
      <OverlayProvider>
        <NavigationProvider>
          <ServiceProvider>
            <PlayerProvider>
              <AppUpdaterProvider>
                { children }
              </AppUpdaterProvider>
            </PlayerProvider>
          </ServiceProvider>
        </NavigationProvider>
      </OverlayProvider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => use(AppContext);
