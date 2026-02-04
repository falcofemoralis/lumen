import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { NOTIFICATIONS_SCREEN, SETTINGS_SCREEN } from 'Navigation/navigationRoutes';
import { useCallback } from 'react';
import NotificationStore from 'Store/Notification.store';
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
  const { isTV } = useConfigContext();

  const handleViewProfile = useCallback(() => {
    viewProfile();
  }, [viewProfile]);

  const handleViewPayments = useCallback(() => {
    viewPayments();
  }, [viewPayments]);

  const handleLogout = useCallback(() => {
    logout();
    resetNotifications();
  }, [logout, resetNotifications]);

  const openSettings = useCallback(() => {
    navigate(SETTINGS_SCREEN);
  }, []);

  const openNotifications = useCallback(() => {
    navigate(NOTIFICATIONS_SCREEN);
  }, []);

  const openNotImplemented = useCallback(() => {
    NotificationStore.displayMessage(t('Not implemented'));
  }, []);

  const containerProps = {
    isSignedIn,
    profile,
    badgeData,
    handleViewProfile,
    handleViewPayments,
    handleLogout,
    openSettings,
    openNotifications,
    openNotImplemented,
  };

  return isTV ? <AccountScreenComponentTV { ...containerProps } /> : <AccountScreenComponent { ...containerProps } />;
}

export default AccountScreenContainer;
