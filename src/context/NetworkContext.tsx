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

// How long to wait for the first network reading before assuming there is a connection.
// Only a guard against the reading never landing at all - the real one arrives in a tick.
const NETWORK_PROBE_TIMEOUT = 3000;

interface NetworkContextInterface {
  // known to be online - false while the first network reading is still pending, so
  // nothing fetches before the connectivity state is actually known
  isInternetAvailable: boolean;
  // known to be offline - false while pending, so the page shows its usual skeletons
  // instead of flashing the network error screen on every cold start
  isOffline: boolean;
  handleConnectionError: (error: Error) => boolean;
}

const NetworkContext = createContext<NetworkContextInterface>({
  isInternetAvailable: false,
  isOffline: false,
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

  // expo-network resolves its first reading asynchronously - `useNetworkState` starts as
  // an empty object - so on a cold start every field is undefined for a tick. Treating
  // that tick as "online" let every query fire before the connectivity state was known,
  // and offline they all failed immediately.
  const isNetworkStateKnown = type !== undefined;

  // Should that reading never land (a rejected native call leaves the hook empty forever),
  // nothing would ever fetch again - fall back to the optimistic assumption instead.
  const [probeTimedOut, setProbeTimedOut] = useState<boolean>(false);

  useEffect(() => {
    const timeout = isNetworkStateKnown
      ? undefined
      : setTimeout(() => setProbeTimedOut(true), NETWORK_PROBE_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [isNetworkStateKnown]);

  const isInternetAvailable = useMemo(() => {
    if (!isNetworkStateKnown) {
      return probeTimedOut;
    }

    return strictConnectionCheck
      ? !!isConnected && !!isInternetReachable && type !== NetworkStateType.VPN && !errorOccurred
      : !errorOccurred;
  }, [
    isConnected,
    isInternetReachable,
    type,
    isNetworkStateKnown,
    probeTimedOut,
    errorOccurred,
    strictConnectionCheck,
  ]);

  // pending is neither online nor offline - only a known-bad state blocks the page
  const isOffline = isNetworkStateKnown && !isInternetAvailable;

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
    isOffline,
    handleConnectionError,
  }), [
    isInternetAvailable,
    isOffline,
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