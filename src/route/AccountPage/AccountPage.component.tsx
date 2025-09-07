import { useNavigation } from '@react-navigation/native';
import Loader from 'Component/Loader';
import LoginForm from 'Component/LoginForm';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import Wrapper from 'Component/Wrapper';
import { useNotificationsContext } from 'Context/NotificationsContext';
import t from 'i18n/t';
import { Bell, Settings } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';
import { NOTIFICATIONS_ROUTE } from 'Route/NotificationsPage/NotificationsPage.config';
import { SETTINGS_ROUTE } from 'Route/SettingsPage/SettingsPage.config';
import NotificationStore from 'Store/Notification.store';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { ACCOUNT_ROUTE } from './AccountPage.config';
import { styles } from './AccountPage.style';
import { AccountPageComponentProps } from './AccountPage.type';

export function AccountPageComponent({
  isSignedIn,
  profile,
}: AccountPageComponentProps) {
  const { badgeData } = useNotificationsContext();
  const navigation = useNavigation();

  const renderTopBarButton = (IconComponent: React.ComponentType<any>, route: string) => {
    return (
      <ThemedPressable
        style={ styles.tobBarBtn }
        onPress={ () => navigation.navigate(route as never) }
      >
        <IconComponent
          style={ styles.tobBarBtnIcon }
          size={ scale(24) }
          color={ Colors.white }
        />
      </ThemedPressable>
    );
  };

  const renderTopBar = () => {
    const badge = badgeData[ACCOUNT_ROUTE] ?? 0;

    return (
      <View style={ styles.topBar }>
        <View>
          { renderTopBarButton(Bell, NOTIFICATIONS_ROUTE) }
          { badge > 0 && (
            <ThemedText style={ styles.badge }>
              { badge }
            </ThemedText>
          ) }
        </View>
        { renderTopBarButton(Settings, SETTINGS_ROUTE) }
      </View>
    );
  };

  const renderProfile = () => {
    if (!profile) {
      return (
        <Loader
          isLoading
          fullScreen
        />
      );
    }

    const {
      avatar,
      name,
      email,
    } = profile;

    return (
      <View style={ styles.profile }>
        <View style={ styles.profileInfo }>
          { avatar ? (
            <ThemedImage
              src={ avatar }
              style={ styles.profileAvatar }
            />
          ) : (
            <Image
              source={ require('../../../assets/images/no_avatar.png') }
              style={ styles.profileAvatar }
            />
          ) }
          <View>
            <ThemedText style={ styles.profileName }>
              { name }
            </ThemedText>
            <View>
              <ThemedText>
                { email }
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={ styles.profileActions }>
          <ThemedButton
            style={ styles.profileAction }
            onPress={ () => NotificationStore.displayMessage(t('Not implemented')) }
          >
            { t('Log out') }
          </ThemedButton>
          <ThemedButton
            style={ styles.profileAction }
            onPress={ () => NotificationStore.displayMessage(t('Not implemented')) }
          >
            { t('Switch service') }
          </ThemedButton>
          <ThemedButton
            style={ styles.profileAction }
            onPress={ () => NotificationStore.displayMessage(t('Not implemented')) }
          >
            { t('View Profile') }
          </ThemedButton>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (!isSignedIn) {
      return <LoginForm withRedirect />;
    }

    return renderProfile();
  };

  return (
    <Page>
      <Wrapper style={ styles.wrapper }>
        { renderTopBar() }
        { renderContent() }
      </Wrapper>
    </Page>
  );
}

export default AccountPageComponent;
