import Loader from 'Component/Loader';
import LoginForm from 'Component/LoginForm';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import React from 'react';
import { Image, View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, SpatialNavigationView } from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import { scale } from 'Util/CreateStyles';

import { styles } from './AccountPage.style.atv';
import { AccountPageComponentProps } from './AccountPage.type';

export function AccountPageComponent({
  isSignedIn,
  profile,
}: AccountPageComponentProps) {
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
        <View style={ styles.profileActionsWrapper }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ scale(64) }
          >
            <SpatialNavigationView
              direction="horizontal"
              style={ styles.profileActions }
            >
              <DefaultFocus>
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
              </DefaultFocus>
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
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
      { renderContent() }
    </Page>
  );
}

export default AccountPageComponent;
