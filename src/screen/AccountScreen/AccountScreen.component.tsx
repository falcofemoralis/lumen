import { Loader } from 'Component/Loader';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Bell, Download, LogOut, MessageSquareText, Settings, Star } from 'lucide-react-native';
import { ACCOUNT_TAB } from 'Navigation/navigationRoutes';
import { Image, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './AccountScreen.style';
import { AccountScreenComponentProps } from './AccountScreen.type';
import { DefaultGradient, GRADIENT_SIZE_MOBILE, PremiumGradient } from './AccountScreenGradients';

export function AccountScreenComponent({
  isSignedIn,
  profile,
  badgeData,
  handleViewProfile,
  handleViewPayments,
  handleLogout,
  openSettings,
  openNotifications,
  openNotImplemented,
}: AccountScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
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
            color={ theme.colors.icon }
          />
        </ThemedPressable>
      </View>
    );
  };

  const renderAvatarContainer = () => {
    const { avatar, name, premiumDays = 0 } = profile ?? {};

    return (
      <View style={ styles.profileInfo }>
        <View style={ styles.profileInfoAvatarContainer }>
          { premiumDays > 0 ? (
            <PremiumGradient style={ styles.profileInfoPremium } size={ scale(GRADIENT_SIZE_MOBILE) } />
          ) : (
            <DefaultGradient style={ styles.profileInfoPremium } size={ scale(GRADIENT_SIZE_MOBILE) } />
          ) }
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
        </View>
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
        <View style={ styles.premiumBadge }>
          <Image
            source={ require('../../../assets/images/prem-content-logo.png') }
            style={ styles.premiumBadgeIcon }
          />
          <ThemedText style={ styles.premiumBadgeHeading }>
            HDrezka Premium
          </ThemedText>
          <ThemedText style={ styles.premiumBadgeText }>
            { t('You have {{days}} days left.', { days: String(premiumDays) }) }
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderActionButton = (
    title: string,
    icon: React.ComponentType<any>,
    action: () => void,
    style?: StyleProp<ViewStyle>
  ) => {
    return (
      <ThemedButton
        style={ [styles.profileAction, style] }
        contentStyle={ styles.profileActionContent }
        textStyle={ styles.profileActionText }
        IconComponent={ icon }
        onPress={ action }
        iconProps={ {
          size: scale(20),
          color: theme.colors.icon,
        } }
      >
        { title }
      </ThemedButton>
    );
  };

  const renderNotificationButton = () => {
    const badge = badgeData[ACCOUNT_TAB] ?? 0;

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
    const { premiumDays = 0 } = profile ?? {};

    return (
      <View style={ styles.profileActions }>
        <View style={ styles.profileActionsGroup }>
          { renderPremiumBadge() }
        </View>
        <View style={ [styles.profileActionsGroup] }>
          { /* eslint-disable-next-line max-len */ }
          { renderActionButton(premiumDays > 0 ? t('Renew subscription') : t('Get subscription'), Star, handleViewPayments, styles.premiumButton) }
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

export default AccountScreenComponent;
