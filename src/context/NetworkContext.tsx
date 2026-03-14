import { NetworkStateType, useNetworkState } from 'expo-network';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useConfigContext } from './ConfigContext';

interface NetworkContextInterface {
  isInternetAvailable: boolean;
  handleConnectionError: (error: Error) => boolean;
}

const NetworkContext = createContext<NetworkContextInterface>({
  isInternetAvailable: false,
  handleConnectionError: () => false,
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const { strictConnectionCheck } = useConfigContext();
  const { isConnected, isInternetReachable, type } = useNetworkState();
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

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