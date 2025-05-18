import Loader from 'Component/Loader';
import LoginForm from 'Component/LoginForm';
import { ACCOUNT_ROUTE } from 'Component/NavigationBar/NavigationBar.config';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { useServiceContext } from 'Context/ServiceContext';
import { router } from 'expo-router';
import t from 'i18n/t';
import React from 'react';
import { Image, View } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { scale } from 'Util/CreateStyles';

import { styles } from './AccountPage.style';
import { AccountPageComponentProps } from './AccountPage.type';

export function AccountPageComponent({
  isSignedIn,
  profile,
}: AccountPageComponentProps) {
  const { badgeData } = useServiceContext();

  const renderTopBar = () => {
    const badge = badgeData[ACCOUNT_ROUTE] ?? 0;

    return (
      <View style={ styles.topBar }>
        <View>
          <ThemedButton
            style={ styles.tobBarBtn }
            iconStyle={ styles.tobBarBtnIcon }
            icon={ {
              name: 'bell-outline',
              pack: IconPackType.MaterialCommunityIcons,
            } }
            iconSize={ scale(24) }
            onPress={ () => router.push({
              pathname: '/(tabs)/(account)/(notifications)/notifications',
            }) }
          />
          { badge > 0 && (
            <View style={ styles.badge } />
          ) }
        </View>
        <ThemedButton
          style={ styles.tobBarBtn }
          iconStyle={ styles.tobBarBtnIcon }
          icon={ {
            name: 'settings-outline',
            pack: IconPackType.Ionicons,
          } }
          iconSize={ scale(24) }
          onPress={ () => router.push({
            pathname: '/(tabs)/(account)/settings',
          }) }
        />
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
      return <LoginForm />;
    }

    return renderProfile();
  };

  return (
    <Page>
      { renderTopBar() }
      { renderContent() }
    </Page>
  );
}

export default AccountPageComponent;
