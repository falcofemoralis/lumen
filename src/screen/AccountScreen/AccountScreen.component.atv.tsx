import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { Loader } from 'Component/Loader';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGroup } from 'Component/ThemedGroup';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Download from 'lucide-react-native/icons/download';
import LogOut from 'lucide-react-native/icons/log-out';
import MessageSquareText from 'lucide-react-native/icons/message-square-text';
import Star from 'lucide-react-native/icons/star';
import { ComponentType } from 'react';
import { Image, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './AccountScreen.style.atv';
import { AccountScreenComponentProps } from './AccountScreen.type';

const GUEST_DOWNLOADS_FOCUS_KEY = 'ACCOUNT_GUEST_DOWNLOADS';
const DEFAULT_ACTION_FOCUS_KEY = 'ACCOUNT_DEFAULT_ACTION';

// a real component rather than a render helper, so that handlers reach it as props
// instead of as call arguments (see react-hooks/refs)
const AccountActionButton = ({
  title,
  IconComponent,
  action,
  style,
  textStyle,
  iconStyle,
  isDefault = false,
}: {
  title: string;
  IconComponent: ComponentType<any>;
  action: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<any>;
  isDefault?: boolean;
}) => {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedButton
      title={ title }
      focusKey={ isDefault ? DEFAULT_ACTION_FOCUS_KEY : undefined }
      autofocus={ isDefault }
      style={ [styles.profileAction, style] }
      contentStyle={ styles.profileActionContent }
      textStyle={ [styles.profileActionText, textStyle] }
      iconColor={ iconStyle?.color }
      IconComponent={ IconComponent }
      onPress={ action }
      iconProps={ {
        size: scale(20),
      } }
    />
  );
};

export function AccountScreenComponent({
  isSignedIn,
  profile,
  handleViewProfile,
  handleViewPayments,
  handleLogout,
  confirmLogout,
  logoutConfirmOverlayRef,
  openMyComments,
  openDownloads,
}: AccountScreenComponentProps) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

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

  const renderAvatarContainer = () => {
    const { avatar, name } = profile ?? {};

    return (
      <View style={ styles.profileInfo }>
        <View style={ styles.profileInfoAvatarContainer }>
          { /* { premiumDays > 0 ? (
            <PremiumGradient style={ styles.profileInfoPremium } size={ scale(GRADIENT_SIZE_TV) } />
          ) : (
            <DefaultGradient style={ [styles.profileInfoPremium] } size={ scale(GRADIENT_SIZE_TV) } />
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
        { renderPremiumBadge() }
      </View>
    );
  };

  const renderActions = () => {
    const { premiumDays = 0 } = profile ?? {};

    return (
      // Without a preferred child, focus entering the list resolves to the
      // subscription button at the top and only then hops down to the default
      // action once its `autofocus` claim runs.
      <ThemedScrollView
        style={ styles.profileActions }
        contentContainerStyle={ styles.profileActionsContent }
        containerStyle={ styles.profileActionsContainer }
        preferredChildFocusKey={ DEFAULT_ACTION_FOCUS_KEY }
      >
        <AccountActionButton
          title={ premiumDays > 0 ? t('Renew subscription') : t('Get subscription') }
          IconComponent={ Star }
          action={ handleViewPayments }
          style={ styles.premiumButton }
          textStyle={ styles.premiumButtonText }
          iconStyle={ styles.premiumButtonIcon }
        />
        <AccountActionButton
          isDefault
          title={ t('Downloads') }
          IconComponent={ Download }
          action={ openDownloads }
        />
        <AccountActionButton
          title={ t('Comments') }
          IconComponent={ MessageSquareText }
          action={ openMyComments }
        />
        <AccountActionButton
          title={ t('View Profile') }
          IconComponent={ Star }
          action={ handleViewProfile }
        />
        <AccountActionButton
          title={ t('Log out') }
          IconComponent={ LogOut }
          action={ handleLogout }
        />
      </ThemedScrollView>
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
      return (
        <ThemedGroup
          style={ styles.guestContent }
          preferredChildFocusKey={ GUEST_DOWNLOADS_FOCUS_KEY }
        >
          <LoginForm>
            <ThemedButton
              title={ t('Downloads') }
              focusKey={ GUEST_DOWNLOADS_FOCUS_KEY }
              autofocus
              IconComponent={ Download }
              onPress={ openDownloads }
              iconProps={ {
                size: scale(20),
              } }
            />
          </LoginForm>
        </ThemedGroup>
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
      { renderContent() }
    </Page>
  );
}

export default AccountScreenComponent;
