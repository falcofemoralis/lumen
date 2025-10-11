import { useNavigation } from '@react-navigation/native';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { NOTIFICATIONS_ROUTE , SETTINGS_ROUTE } from 'Navigation/routes';
import { useCallback } from 'react';
import NotificationStore from 'Store/Notification.store';

import AccountPageComponent from './AccountPage.component';
import AccountPageComponentTV from './AccountPage.component.atv';

export function AccountPageContainer() {
  const {
    logout,
    viewProfile,
    viewPayments,
    isSignedIn,
    profile,
    badgeData,
    resetNotifications,
  } = useServiceContext();
  const navigation = useNavigation();

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
    navigation.navigate(SETTINGS_ROUTE);
  }, [navigation]);

  const openNotifications = useCallback(() => {
    navigation.navigate(NOTIFICATIONS_ROUTE);
  }, [navigation]);

  const openNotImplemented = useCallback(() => {
    NotificationStore.displayMessage(t('Not implemented'));
  }, []);

  const containerProps = () => ({
    isSignedIn,
    profile,
    badgeData,
    handleViewProfile,
    handleViewPayments,
    handleLogout,
    openSettings,
    openNotifications,
    openNotImplemented,
  });

  return withTV(AccountPageComponentTV, AccountPageComponent, {
    ...containerProps(),
  });
}

export default AccountPageContainer;
