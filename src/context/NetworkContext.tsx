import { useQueryClient } from '@tanstack/react-query';
import { NetworkStateType, useNetworkState } from 'expo-network';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setConnectionErrorHandler } from 'Util/Query';

import { useConfigContext } from './ConfigContext';

interface NetworkContextInterface {
  isInternetAvailable: boolean;
  handleConnectionError: (error: Error) => boolean;
}

const NetworkContext = createContext<NetworkContextInterface>({
  isInternetAvailable: false,
  handleConnectionError: () => false,
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const { strictConnectionCheck } = useConfigContext();
  const queryClient = useQueryClient();
  const { isConnected, isInternetReachable, type } = useNetworkState();
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);
  const [wasOnline, setWasOnline] = useState<boolean>(false);

  const isOnline = !!isConnected && !!isInternetReachable;

  // A request failure latches the offline state, so the OS reporting a reachable
  // network again is what clears it - otherwise one failed fetch keeps the app
  // offline until restart. Adjusted during render rather than in an effect, so the
  // recovery lands in the same commit as the connectivity change.
  // https://react.dev/learn/you-might-not-need-an-effect
  if (isOnline !== wasOnline) {
    setWasOnline(isOnline);

    if (isOnline) {
      setErrorOccurred(false);
    }
  }

  // Queries that failed while offline stay parked in `error` with no data, and nothing
  // brings them back on its own: their observers live above <Page>, so hiding the screen
  // behind the offline block never unmounts them (no refetch-on-mount), and
  // `refetchOnReconnect` is inert in React Native - react-query's onlineManager only
  // listens for browser online/offline events, so it reports "online" forever.
  // Without this the screen returns from the offline block into an endless skeleton.
  // Feeding onlineManager from expo-network instead would pause queries rather than let
  // them fail, and a failed request is exactly what `errorOccurred` above is built on.
  useEffect(() => {
    if (!isOnline) {
      return;
    }

    queryClient.resetQueries({
      predicate: ({ state }) => state.status === 'error',
    });
  }, [isOnline, queryClient]);

  const isInternetAvailable = useMemo(() => {
    if (!type) {
      return true;
    }

    const result = strictConnectionCheck
      ? isConnected && isInternetReachable && type !== NetworkStateType.VPN && !errorOccurred
      : !errorOccurred;

    return result ?? true;
  }, [isConnected, isInternetReachable, type, errorOccurred, strictConnectionCheck]);

  const handleConnectionError = useCallback((error: Error) => {
    const msg = error instanceof Error ? error.message : String(error);

    if (msg === 'TypeError: Network request failed') {
      setErrorOccurred(true);

      return true;
    }

    return false;
  }, []);

  // failed queries and mutations report through the query client, which lives outside
  // React - give it a way back into the offline state
  useEffect(() => {
    setConnectionErrorHandler(handleConnectionError);

    return () => setConnectionErrorHandler(null);
  }, [handleConnectionError]);

  const value = useMemo(() => ({
    isInternetAvailable,
    handleConnectionError,
  }), [
    isInternetAvailable,
    handleConnectionError,
  ]);

  return (
    <NetworkContext.Provider value={ value }>
      { children }
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetworkContext must be used within a NetworkProvider');

  return context;
};