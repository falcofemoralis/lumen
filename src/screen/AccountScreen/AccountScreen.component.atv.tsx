import { Loader } from 'Component/Loader';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Download, LogOut, MessageSquareText, Star } from 'lucide-react-native';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './AccountScreen.style.atv';
import { AccountScreenComponentProps } from './AccountScreen.type';
import { DefaultGradient, GRADIENT_SIZE_TV, PremiumGradient } from './AccountScreenGradients';

export function AccountScreenComponent({
  isSignedIn,
  profile,
  handleViewProfile,
  handleViewPayments,
  handleLogout,
  openNotImplemented,
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
    const { avatar, name, premiumDays = 0 } = profile ?? {};

    return (
      <View style={ styles.profileInfo }>
        <View style={ styles.profileInfoAvatarContainer }>
          { premiumDays > 0 ? (
            <PremiumGradient style={ styles.profileInfoPremium } size={ scale(GRADIENT_SIZE_TV) } />
          ) : (
            <DefaultGradient style={ [styles.profileInfoPremium] } size={ scale(GRADIENT_SIZE_TV) } />
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
        { renderPremiumBadge() }
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
        } }
        variant="long"
        withAnimation
      >
        { title }
      </ThemedButton>
    );
  };

  const renderActions = () => {
    const { premiumDays = 0 } = profile ?? {};

    return (
      <SpatialNavigationScrollView>
        <View style={ styles.profileActions }>
          { /* eslint-disable-next-line max-len */ }
          { renderActionButton(premiumDays > 0 ? t('Renew subscription') : t('Get subscription'), Star, handleViewPayments, styles.premiumButton) }
          <DefaultFocus>
            { renderActionButton(t('Downloads'), Download, openDownloads) }
          </DefaultFocus>
          { renderActionButton(t('Comments'), MessageSquareText, openNotImplemented) }
          { renderActionButton(t('View Profile'), Star, handleViewProfile) }
          { renderActionButton(t('Log out'), LogOut, handleLogout) }
        </View>
      </SpatialNavigationScrollView>
    );
  };

  const renderContent = () => {
    if (!isSignedIn) {
      return <LoginForm />;
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
      { renderContent() }
    </Page>
  );
}

export default AccountScreenComponent;
