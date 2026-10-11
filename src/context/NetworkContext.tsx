import { useQueryClient } from '@tanstack/react-query';
import { getNetworkStateAsync, NetworkState, NetworkStateType, useNetworkState } from 'expo-network';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { isNetworkFailure, isRecoverableSourceFailure } from 'Util/NetworkRecovery';
import { setConnectionErrorHandler } from 'Util/Query';

import { useConfigContext } from './ConfigContext';

// How long to wait for the first network reading before assuming there is a connection.
// Only a guard against the reading never landing at all - the real one arrives in a tick.
const NETWORK_PROBE_TIMEOUT = 3000;
// How long a known-bad reading has to persist before the offline screen shows,
// so a resume-from-background blip doesn't trigger it.
const OFFLINE_DEBOUNCE_MS = 3000;

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
  const observedNetwork = useNetworkState();
  const [verifiedNetwork, setVerifiedNetwork] = useState<NetworkState | null>(null);
  const { isConnected, isInternetReachable, type } = verifiedNetwork ?? observedNetwork;
  useEffect(() => setVerifiedNetwork(null), [
    observedNetwork.isConnected, observedNetwork.isInternetReachable, observedNetwork.type,
  ]);
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

    queryClient.refetchQueries({
      type: 'active',
      predicate: ({ state }) => state.status === 'error' && isRecoverableSourceFailure(state.error),
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

  // A resume from background briefly reports a stale/incorrect reading before the
  // real one lands, which would otherwise flash the offline screen for no reason.
  // Debounce the transition into offline; recovery back to online stays immediate.
  const [debouncedIsOffline, setDebouncedIsOffline] = useState<boolean>(false);

  useEffect(() => {
    if (!isOffline) {
      setDebouncedIsOffline(false);

      return undefined;
    }

    const timeout = setTimeout(() => setDebouncedIsOffline(true), OFFLINE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [isOffline]);

  const lastRecovery = useRef(0);
  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const recoverConnection = useCallback(async () => {
    try {
      const network = await getNetworkStateAsync();
      setVerifiedNetwork(network);
      if (!network.isConnected || network.isInternetReachable === false) {
        setErrorOccurred(true);
        return;
      }
      setErrorOccurred(false);
      if (AppState.currentState !== 'active' || Date.now() - lastRecovery.current < 60000) return;
      if (!queryClient.getQueryCache().getAll().some((query) =>
        query.isActive() && query.state.status === 'error' && isRecoverableSourceFailure(query.state.error))) return;
      lastRecovery.current = Date.now();
      await queryClient.refetchQueries({
        type: 'active',
        predicate: ({ state }) => state.status === 'error' && isRecoverableSourceFailure(state.error),
      });
    } catch {
      // A failed native probe is not proof that every source is offline.
      setErrorOccurred(false);
    }
  }, [queryClient]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void recoverConnection();
    });
    // Checks local query state only; refetches after a provider's cooldown, never during it.
    const recoveryPoll = setInterval(() => {
      if (AppState.currentState === 'active' && queryClient.getQueryCache().getAll().some(query =>
        query.isActive() && query.state.status === 'error' && isRecoverableSourceFailure(query.state.error))) void recoverConnection();
    }, 30_000);
    return () => {
      subscription.remove();
      clearInterval(recoveryPoll);
      clearTimeout(recoveryTimer.current);
    };
  }, [recoverConnection, queryClient]);

  const handleConnectionError = useCallback((error: Error) => {
    const msg = error instanceof Error ? error.message : String(error);

    if (isNetworkFailure(msg)) {
      // A single unreachable host must not disable and re-enable every query.
      if (!isOnline) setErrorOccurred(true);
      clearTimeout(recoveryTimer.current);
      recoveryTimer.current = setTimeout(() => void recoverConnection(), 1500);

      return true;
    }

    return false;
  }, [recoverConnection, isOnline]);

  // failed queries and mutations report through the query client, which lives outside
  // React - give it a way back into the offline state
  useEffect(() => {
    setConnectionErrorHandler(handleConnectionError);

    return () => setConnectionErrorHandler(null);
  }, [handleConnectionError]);

  const value = useMemo(() => ({
    isInternetAvailable,
    isOffline: debouncedIsOffline,
    handleConnectionError,
  }), [
    isInternetAvailable,
    debouncedIsOffline,
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
