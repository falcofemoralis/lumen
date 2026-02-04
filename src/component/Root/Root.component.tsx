import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as StatusBar from 'expo-status-bar';
import { useEffect } from 'react';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useServiceContext();
  const { fetchUserData } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();
  const { isTV } = useConfigContext();

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  useEffect(() => {
    if(isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn, fetchUserData]);

  useEffect(() => {
    if (isTV) {
      StatusBar.setStatusBarHidden(true);
    }
  }, [isTV]);

  return children;
};

export default Root;