import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as StatusBar from 'expo-status-bar';
import { useAwake } from 'Hooks/useAwake';
import { useEffect } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import ConfigStore, { DEVICE_CONFIG } from 'Store/Config.store';
import StorageStore from 'Store/Storage.store';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useServiceContext();
  const { fetchUserData } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();
  const { startAwake } = useAwake();
  const config = useMMKVString(DEVICE_CONFIG, StorageStore.getConfigStorage());

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  useEffect(() => {
    if(isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn, fetchUserData]);

  useEffect(() => {
    return startAwake();
  }, [startAwake, config]);

  useEffect(() => {
    if (ConfigStore.isTV()) {
      StatusBar.setStatusBarHidden(true);
    }
  }, []);

  return children;
};

export default Root;