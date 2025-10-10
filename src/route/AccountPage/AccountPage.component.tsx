import Loader from 'Component/Loader';
import LoginForm from 'Component/LoginForm';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedSafeArea from 'Component/ThemedSafeArea';
import ThemedText from 'Component/ThemedText';
import Wrapper from 'Component/Wrapper';
import { LinearGradient } from 'expo-linear-gradient';
import t from 'i18n/t';
import { Bell, Download, LogOut, MessageSquareText, Settings, Star } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import AnimatedGlow from 'react-native-animated-glow';
import { Pressable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { ACCOUNT_ROUTE, defaultPreset, premiumPreset } from './AccountPage.config';
import { styles } from './AccountPage.style';
import { AccountPageComponentProps } from './AccountPage.type';

export function AccountPageComponent({
  isSignedIn,
  profile,
  badgeData,
  handleViewProfile,
  handleViewPayments,
  handleLogout,
  openSettings,
  openNotifications,
  openNotImplemented,
}: AccountPageComponentProps) {
  const { top } = useSafeAreaInsets();

  const renderTopBar = () => {
    return (
      <View style={ styles.topBar }>
        <ThemedPressable
          style={ styles.tobBarBtn }
          onPress={ openSettings }
        >
          <Settings
            style={ styles.tobBarBtnIcon }
            size={ scale(24) }
            color={ Colors.white }
          />
        </ThemedPressable>
      </View>
    );
  };

  const renderAvatarContainer = () => {
    const { avatar, name, premiumDays = 0 } = profile ?? {};

    return (
      <View style={ styles.profileInfo }>
        <AnimatedGlow preset={ premiumDays > 0 ? premiumPreset : defaultPreset } style={ styles.profileInfoPremium }>
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
        </AnimatedGlow>
        <View>
          <ThemedText style={ styles.profileName }>
            { t('You') }
          </ThemedText>
          <ThemedText style={ styles.profileSubname }>
            { name }
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderPremiumBadge = () => {
    const { premiumDays = 0 } = profile ?? {};

    if (!premiumDays) {
      return null;
    }

    return (
      <View style={ styles.premiumBadgeContainer }>
        <LinearGradient
          style={ styles.premiumBadgeGradient }
          colors={ ['#C383E1', '#5B359A'] }
          start={ { x: 1, y: 1 } }
          end={ { x: 0, y: 0 } }
        />
        <Pressable
          style={ styles.premiumBadge }
          onPress={ handleViewPayments }
        >
          <Image
            source={ require('../../../assets/images/prem-content-logo.png') }
            style={ styles.premiumBadgeIcon }
          />
          <ThemedText style={ styles.premiumBadgeHeading }>
            HDrezka Premium
          </ThemedText>
          <ThemedText style={ styles.premiumBadgeText }>
            { t('You have %s days left.', String(premiumDays)) }
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  const renderActionButton = (
    title: string,
    icon: React.ComponentType<any>,
    action: () => void
  ) => {
    return (
      <ThemedButton
        style={ styles.profileAction }
        contentStyle={ styles.profileActionContent }
        textStyle={ styles.profileActionText }
        IconComponent={ icon }
        onPress={ action }
        iconProps={ {
          size: scale(20),
          color: Colors.white,
        } }
      >
        { title }
      </ThemedButton>
    );
  };

  const renderNotificationButton = () => {
    const badge = badgeData[ACCOUNT_ROUTE] ?? 0;

    return (
      <View style={ styles.badgeContainer }>
        { badge > 0 && (
          <ThemedText style={ styles.badge }>
            { badge }
          </ThemedText>
        ) }
        { renderActionButton(t('Notifications'), Bell, openNotifications) }
      </View>
    );
  };

  const renderActions = () => {
    return (
      <View style={ styles.profileActions }>
        <View style={ styles.profileActionsGroup }>
          { renderPremiumBadge() }
        </View>
        <View style={ [styles.profileActionsGroup] }>
          { renderNotificationButton() }
          { renderActionButton(t('Downloads'), Download, openNotImplemented) }
          { renderActionButton(t('Comments'), MessageSquareText, openNotImplemented) }
          { renderActionButton(t('View Profile'), Star, handleViewProfile) }
        </View>
        <View style={ [styles.profileActionsGroup] }>
          { renderActionButton(t('Log out'), LogOut, handleLogout) }
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (!isSignedIn) {
      return (
        <LoginForm withRedirect />
      );
    }

    if (!profile) {
      return (
        <Loader
          isLoading
          fullScreen
        />
      );
    }

    return (
      <View style={ styles.content }>
        { renderAvatarContainer() }
        { renderActions() }
      </View>
    );
  };

  return (
    <Page>
      <ThemedSafeArea edges={ ['left', 'right'] }>
        <ScrollView style={ { paddingTop: top } } contentContainerStyle={ styles.scrollView }>
          <Wrapper style={ styles.wrapper }>
            { renderTopBar() }
            { renderContent() }
          </Wrapper>
        </ScrollView>
      </ThemedSafeArea>
    </Page>
  );
}

export default AccountPageComponent;
