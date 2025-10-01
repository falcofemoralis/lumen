import { services } from 'Api/services';
import Loader from 'Component/Loader';
import LoginForm from 'Component/LoginForm';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { useNotificationsContext } from 'Context/NotificationsContext';
import { DEFAULT_SERVICE, useServiceContext } from 'Context/ServiceContext';
import t from 'i18n/t';
import React from 'react';
import { Image, View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, SpatialNavigationView } from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';

import { styles } from './AccountPage.style.atv';
import { AccountPageComponentProps } from './AccountPage.type';

export function AccountPageComponent({
  isSignedIn,
  profile,
}: AccountPageComponentProps) {
  const { logout, viewProfile } = useServiceContext();
  const { resetNotifications } = useNotificationsContext();

  const renderProfile = () => {
    if (!profile) {
      return (
        <Loader
          isLoading
          fullScreen
        />
      );
    }

    const { avatar, name } = profile;

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
              { t('You') }
            </ThemedText>
            <ThemedText>
              { name }
            </ThemedText>
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
                  onPress={ () => {
                    logout();
                    resetNotifications();
                  } }
                >
                  { t('Log out') }
                </ThemedButton>
                <ThemedButton
                  style={ styles.profileAction }
                  onPress={ viewProfile }
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
