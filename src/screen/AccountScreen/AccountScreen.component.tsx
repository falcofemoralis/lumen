import { ConfirmOverlay } from 'Component/ConfirmOverlay';
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
import Bell from 'lucide-react-native/icons/bell';
import Download from 'lucide-react-native/icons/download';
import LogOut from 'lucide-react-native/icons/log-out';
import MessageSquareText from 'lucide-react-native/icons/message-square-text';
import Settings from 'lucide-react-native/icons/settings';
import Star from 'lucide-react-native/icons/star';
import { ACCOUNT_TAB } from 'Navigation/navigationRoutes';
import { ComponentType } from 'react';
import { Image, ScrollView, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './AccountScreen.style';
import { AccountScreenComponentProps } from './AccountScreen.type';

// a real component rather than a render helper, so that handlers reach it as props
// instead of as call arguments (see react-hooks/refs)
const AccountActionButton = ({
  title,
  IconComponent,
  action,
  style,
  textStyle,
  iconStyle,
}: {
  title: string;
  IconComponent: ComponentType<any>;
  action: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<any>;
}) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedButton
      title={ title }
      style={ [styles.profileAction, style] }
      contentStyle={ styles.profileActionContent }
      textStyle={ [styles.profileActionText, textStyle] }
      IconComponent={ IconComponent }
      onPress={ action }
      iconProps={ {
        size: scale(20),
        color: iconStyle ? iconStyle.color : theme.colors.icon,
      } }
    />
  );
};

export function AccountScreenComponent({
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
  openNotImplemented,
  openDownloads,
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
    const { avatar, name } = profile ?? {};

    return (
      <View style={ styles.profileInfo }>
        <View style={ styles.profileInfoAvatarContainer }>
          { /* { premiumDays > 0 ? (
            <PremiumGradient style={ styles.profileInfoPremium } size={ scale(GRADIENT_SIZE_MOBILE) } />
          ) : (
            <DefaultGradient style={ styles.profileInfoPremium } size={ scale(GRADIENT_SIZE_MOBILE) } />
          ) } */ }
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

  const renderNotificationButton = () => {
    const badge = badgeData[ACCOUNT_TAB] ?? 0;

    return (
      <View style={ styles.badgeContainer }>
        { badge > 0 && (
          <ThemedText style={ styles.badge }>
            { badge }
          </ThemedText>
        ) }
        <AccountActionButton
          title={ t('Notifications') }
          IconComponent={ Bell }
          action={ openNotifications }
        />
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
          <AccountActionButton
            title={ premiumDays > 0 ? t('Renew subscription') : t('Get subscription') }
            IconComponent={ Star }
            action={ handleViewPayments }
            style={ styles.premiumButton }
            textStyle={ styles.premiumButtonText }
            iconStyle={ styles.premiumButtonIcon }
          />
          { renderNotificationButton() }
          <AccountActionButton
            title={ t('Downloads') }
            IconComponent={ Download }
            action={ openDownloads }
          />
          <AccountActionButton
            title={ t('Comments') }
            IconComponent={ MessageSquareText }
            action={ openNotImplemented }
          />
          <AccountActionButton
            title={ t('View Profile') }
            IconComponent={ Star }
            action={ handleViewProfile }
          />
        </View>
        <View style={ [styles.profileActionsGroup] }>
          <AccountActionButton
            title={ t('Log out') }
            IconComponent={ LogOut }
            action={ handleLogout }
          />
        </View>
      </View>
    );
  };

  const renderLogoutConfirmOverlay = () => {
    return (
      <ConfirmOverlay
        overlayRef={ logoutConfirmOverlayRef }
        title={ t('Are you sure?') }
        message={ t('Are you sure you want to log out?') }
        confirmButtonText={ t('Log out') }
        onConfirm={ confirmLogout }
      />
    );
  };

  const renderContent = () => {
    if (!isSignedIn) {
      if (isLocalLibrary) {
        return (
          <View style={ styles.guestContent }>
            { renderNotificationButton() }
            <AccountActionButton
              title={ t('Downloads') }
              IconComponent={ Download }
              action={ openDownloads }
            />
          </View>
        );
      }

      return (
        <LoginForm>
          <ThemedButton
            title={ t('Downloads') }
            IconComponent={ Download }
            onPress={ openDownloads }
            iconProps={ {
              size: scale(20),
              color: theme.colors.icon,
            } }
          />
        </LoginForm>
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
    <Page checkConnection={ false }>
      { renderLogoutConfirmOverlay() }
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
