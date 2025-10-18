import {
  createContext,
  JSX,
  use,
  useMemo,
} from 'react';

import { AppUpdaterProvider } from './AppUpdaterContext';
import { NavigationProvider } from './NavigationContext';
import { PlayerProvider } from './PlayerContext';
import { PlayerProgressProvider } from './PlayerProgressContext';
import { ServiceProvider } from './ServiceContext';

interface AppContextInterface {
}

const AppContext = createContext<AppContextInterface>({
});

type Props = { children: React.ReactNode };
type Provider = (p: Props) => JSX.Element;

export const composeProviders = (...p: Provider[]) =>
  p.reduceRight(
    (Acc, P) => ({ children }: Props) =>
      <P><Acc>{ children }</Acc></P>,
    ({ children }: Props) => <>{ children }</>
  );

export const AppProviders = composeProviders(
  NavigationProvider,
  ServiceProvider,
  PlayerProvider,
  PlayerProgressProvider,
  AppUpdaterProvider
);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useMemo(() => ({}), []);

  return (
    <AppContext.Provider value={ value }>
      <AppProviders>
        { children }
      </AppProviders>
    </AppContext.Provider>
  );
};

export const useAppContext = () => use(AppContext);
