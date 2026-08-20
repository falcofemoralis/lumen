import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import {
  DOWNLOADS_SCREEN,
  MY_COMMENTS_SCREEN,
  NOTIFICATIONS_SCREEN,
  SETTINGS_SCREEN,
} from 'Navigation/navigationRoutes';
import { useCallback, useRef } from 'react';
import { navigate } from 'Util/Navigation';

import AccountScreenComponent from './AccountScreen.component';
import AccountScreenComponentTV from './AccountScreen.component.atv';

export function AccountScreenContainer() {
  const {
    logout,
    viewProfile,
    viewPayments,
    isSignedIn,
    profile,
    badgeData,
    resetNotifications,
  } = useServiceContext();
  const { isTV, isLocalLibrary } = useConfigContext();
  const logoutConfirmOverlayRef = useRef<ThemedOverlayRef | null>(null);

  const handleViewProfile = useCallback(() => {
    viewProfile();
  }, [viewProfile]);

  const handleViewPayments = useCallback(() => {
    viewPayments();
  }, [viewPayments]);

  const handleLogout = useCallback(() => {
    logoutConfirmOverlayRef.current?.open();
  }, []);

  const confirmLogout = useCallback(() => {
    logoutConfirmOverlayRef.current?.close();
    logout(true);
    resetNotifications();
  }, [logout, resetNotifications]);

  const openSettings = useCallback(() => {
    navigate(SETTINGS_SCREEN);
  }, []);

  const openNotifications = useCallback(() => {
    navigate(NOTIFICATIONS_SCREEN);
  }, []);

  const openDownloads = useCallback(() => {
    navigate(DOWNLOADS_SCREEN);
  }, []);

  const openMyComments = useCallback(() => {
    navigate(MY_COMMENTS_SCREEN);
  }, []);

  const containerProps = {
    isSignedIn,
    isLocalLibrary,
    profile,
    badgeData,
    handleViewProfile,
    handleViewPayments,
    handleLogout,
    confirmLogout,
    logoutConfirmOverlayRef,
    openSettings,
    openNotifications,
    openMyComments,
    openDownloads,
  };

  return isTV ? <AccountScreenComponentTV { ...containerProps } /> : <AccountScreenComponent { ...containerProps } />;
}

export default AccountScreenContainer;