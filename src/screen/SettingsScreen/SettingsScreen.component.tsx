import { Header } from 'Component/Header';
import { Page } from 'Component/Page';
import { SettingBase } from 'Component/SettingBase';
import { SettingCustomSelect } from 'Component/SettingCustomSelect';
import { SettingInput } from 'Component/SettingInput';
import { SettingLink } from 'Component/SettingLink';
import { SettingSelect } from 'Component/SettingSelect';
import { SettingSwitch } from 'Component/SettingSwitch';
import { SettingText } from 'Component/SettingText';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import ArrowDown10 from 'lucide-react-native/icons/arrow-down-1-0';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import BookImage from 'lucide-react-native/icons/book-image';
import Brush from 'lucide-react-native/icons/brush';
import Subtitles from 'lucide-react-native/icons/captions';
import CircleGauge from 'lucide-react-native/icons/circle-gauge';
import CircleQuestionMark from 'lucide-react-native/icons/circle-question-mark';
import Cloud from 'lucide-react-native/icons/cloud';
import CloudCog from 'lucide-react-native/icons/cloud-cog';
import CloudOff from 'lucide-react-native/icons/cloud-off';
import Download from 'lucide-react-native/icons/download';
import ExternalLink from 'lucide-react-native/icons/external-link';
import FolderCog from 'lucide-react-native/icons/folder-cog';
import FolderDown from 'lucide-react-native/icons/folder-down';
import FolderLock from 'lucide-react-native/icons/folder-lock';
import Gauge from 'lucide-react-native/icons/gauge';
import Globe from 'lucide-react-native/icons/globe';
import GlobeLock from 'lucide-react-native/icons/globe-lock';
import Grid3x2 from 'lucide-react-native/icons/grid-3x2';
import Info from 'lucide-react-native/icons/info';
import Loader from 'lucide-react-native/icons/loader';
import LoaderCircle from 'lucide-react-native/icons/loader-circle';
import Maximize2 from 'lucide-react-native/icons/maximize-2';
import MoveRight from 'lucide-react-native/icons/move-right';
import Palette from 'lucide-react-native/icons/palette';
import Pin from 'lucide-react-native/icons/pin';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Rewind from 'lucide-react-native/icons/rewind';
import Route from 'lucide-react-native/icons/route';
import Settings2 from 'lucide-react-native/icons/settings-2';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import StepForward from 'lucide-react-native/icons/step-forward';
import TvMinimalPlay from 'lucide-react-native/icons/tv-minimal-play';
import UserCog from 'lucide-react-native/icons/user-cog';
import { reactNativeDownloads } from 'Modules/react-native-downloads';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { GithubIcon, TelegramIcon } from 'Theme/icons';
import { openLinkInBrowser } from 'Util/Link';

import {
  APP_LANGUAGE_OPTIONS,
  COLUMNS_MOBILE_OPTIONS,
  GITHUB_LINK,
  MOBILE_SCREENS,
  PLAYER_ASPECT_RATIO_OPTIONS,
  PLAYER_BUFFER_TIME_OPTIONS,
  PLAYER_LONG_PRESS_SPEED_OPTIONS,
  PLAYER_QUALITY_OPTIONS,
  PLAYER_REWIND_OPTIONS,
  PLAYER_SPEED_OPTIONS,
  TELEGRAM_LINK,
  THEME_SCHEME_OPTIONS,
} from './SettingsScreen.config';
import { componentStyles } from './SettingsScreen.style';
import { SETTING_GROUP, SettingsScreenComponentProps } from './SettingsScreen.type';
import { useTripleTap } from './useTripleTap';

export function SettingsScreenComponent({
  initialRoute,
  numberOfColumnsMobile,
  playerRewindSeconds,
  playerShowBufferTime,
  playerShowEndTime,
  isFirestore,
  securedSettings,
  downloadsPath,
  downloadsSaveSubtitles,
  downloadsSavePoster,
  playerAutoNextEpisode,
  playerLongPressSpeed,
  sortVoicesByRating,
  playerBufferTimeSetting,
  checkForUpdates,
  playerSaveQuality,
  playerAskQuality,
  strictConnectionCheck,
  playerDefaultAspectRatio,
  playerDefaultSpeed,
  isContinueBtnEnabled,
  isLocalLibrary,
  theme,
  themeScheme,
  appLanguage,
  playerQuality,
  officialMode,
  provider,
  officialShareLink,
  automaticCDN,
  cdn,
  userAgent,
  providerOptions,
  cdnOptions,
  downloadsPathOptions,
  appVersion,
  onConfigUpdate,
  onLanguageChange,
  onThemeSchemeChange,
  onLocalLibraryChange,
  onOfficialModeChange,
  onProviderChange,
  onOfficialShareLinkChange,
  onAutomaticCDNChange,
  onCDNChange,
  onUserAgentChange,
  onPlayerQualityChange,
}: SettingsScreenComponentProps) {
  const { handleTap } = useTripleTap();
  const styles = useThemedStyles(componentStyles);
  const [currentGroup, setCurrentGroup] = useState<SETTING_GROUP | null>(null);

  const handleOpenGroup = useCallback((group: SETTING_GROUP) => {
    setCurrentGroup(group);
  }, []);

  const handleBackToGroups = useCallback(() => {
    setCurrentGroup(null);
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!currentGroup) {
        return false;
      }

      handleBackToGroups();

      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [currentGroup, handleBackToGroups]);

  const onVersionPress = useCallback(() => {
    if (handleTap()) {
      onConfigUpdate('securedSettings', true);
    }
  }, [handleTap, onConfigUpdate]);

  const renderGroups = () => (
    <ThemedScrollView>
      <SettingBase
        title={ t('Appearance') }
        IconComponent={ Palette }
        onPress={ () => handleOpenGroup(SETTING_GROUP.APPEARANCE) }
      />
      <SettingBase
        title={ t('Network') }
        IconComponent={ Globe }
        onPress={ () => handleOpenGroup(SETTING_GROUP.NETWORK) }
      />
      <SettingBase
        title={ t('Downloads') }
        IconComponent={ Download }
        onPress={ () => handleOpenGroup(SETTING_GROUP.DOWNLOADS) }
      />
      <SettingBase
        title={ t('Player') }
        IconComponent={ TvMinimalPlay }
        onPress={ () => handleOpenGroup(SETTING_GROUP.PLAYER) }
      />
      <SettingBase
        title={ t('About') }
        IconComponent={ Info }
        onPress={ () => handleOpenGroup(SETTING_GROUP.ABOUT) }
      />
    </ThemedScrollView>
  );

  const renderAppearance = () => (
    <ThemedScrollView>
      <SettingSelect
        title={ t('Theme scheme') }
        IconComponent={ Brush }
        value={ themeScheme ?? 'system' }
        options={ THEME_SCHEME_OPTIONS }
        onChange={ onThemeSchemeChange }
      />
      <SettingSelect
        title={ t('Interface language') }
        IconComponent={ Globe }
        value={ appLanguage }
        options={ APP_LANGUAGE_OPTIONS }
        onChange={ onLanguageChange }
      />
      <SettingSelect
        title={ t('Initial route') }
        IconComponent={ Route }
        value={ initialRoute }
        options={ MOBILE_SCREENS }
        onChange={ (value) => onConfigUpdate('initialRoute', value) }
      />
      <SettingSelect
        title={ t('Columns in list') }
        IconComponent={ Grid3x2 }
        value={ numberOfColumnsMobile.toString() }
        options={ COLUMNS_MOBILE_OPTIONS }
        onChange={ (value) => onConfigUpdate('numberOfColumnsMobile', Number(value)) }
      />
      <SettingSwitch
        title={ t('Local mode') }
        subtitle={ t('Store bookmarks and watch history on this device only.') }
        IconComponent={ CloudOff }
        value={ isLocalLibrary }
        onChange={ onLocalLibraryChange }
      />
      <SettingSwitch
        title={ t('Sort voices by rating') }
        subtitle={ t('Toggle sorting voices by rating.') }
        IconComponent={ ArrowDown10 }
        value={ sortVoicesByRating }
        onChange={ (value) => onConfigUpdate('sortVoicesByRating', value) }
      />
      <SettingSwitch
        title={ t('Continue button enabled') }
        subtitle={ t('Toggle continue button.') }
        IconComponent={ ArrowRight }
        value={ isContinueBtnEnabled }
        onChange={ (value) => onConfigUpdate('isContinueBtnEnabled', value) }
      />
    </ThemedScrollView>
  );

  const renderNetwork = () => (
    <ThemedScrollView>
      <SettingSwitch
        title={ t('Official mode') }
        subtitle={ t('Links will be used as in the official application.') }
        IconComponent={ ShieldCheck }
        value={ officialMode }
        confirmation={ {
          title: t('Are you sure?'),
          message: t('Please wait a bit after enabling.'),
        } }
        withLoader
        onChange={ onOfficialModeChange }
      />
      <SettingCustomSelect
        title={ t('Provider') }
        IconComponent={ CloudCog }
        value={ provider }
        options={ providerOptions }
        confirmation={ {
          title: t('Are you sure?'),
          message: t('Please wait a bit after enabling.'),
        } }
        withLoader
        onChange={ onProviderChange }
      />
      <SettingCustomSelect
        title={ t('Official mode share link') }
        IconComponent={ ExternalLink }
        value={ officialShareLink }
        options={ providerOptions }
        isEnabled={ officialMode }
        onChange={ onOfficialShareLinkChange }
      />
      <SettingSwitch
        title={ t('Automatic CDN') }
        subtitle={ t('Toggle automatic CDN usage.') }
        IconComponent={ FolderLock }
        value={ automaticCDN }
        confirmation={ { title: t('Are you sure?') } }
        withLoader
        onChange={ onAutomaticCDNChange }
      />
      <SettingCustomSelect
        title={ t('CDN') }
        IconComponent={ FolderCog }
        value={ cdn }
        options={ cdnOptions }
        isEnabled={ !automaticCDN }
        confirmation={ {
          title: t('Are you sure?'),
          message: t('Please wait a bit after enabling.'),
        } }
        withLoader
        onChange={ onCDNChange }
      />
      <SettingSwitch
        title={ t('Strict connection check') }
        subtitle={ t('Toggle strict connection check.') }
        IconComponent={ GlobeLock }
        value={ strictConnectionCheck }
        onChange={ (value) => onConfigUpdate('strictConnectionCheck', value) }
      />
      <SettingInput
        title={ t('Useragent') }
        IconComponent={ UserCog }
        value={ userAgent }
        onChange={ onUserAgentChange }
      />
    </ThemedScrollView>
  );

  const renderDownloads = () => (
    <ThemedScrollView>
      <SettingSelect
        title={ t('Downloads path') }
        IconComponent={ FolderDown }
        value={ downloadsPath ?? reactNativeDownloads.getDefaultDownloadDirectory() ?? '' }
        options={ downloadsPathOptions }
        onChange={ (value) => onConfigUpdate('downloadsPath', value) }
      />
      <SettingSwitch
        title={ t('Download subtitles') }
        subtitle={ t('Toggle download subtitles.') }
        IconComponent={ Subtitles }
        value={ downloadsSaveSubtitles }
        onChange={ (value) => onConfigUpdate('downloadsSaveSubtitles', value) }
      />
      <SettingSwitch
        title={ t('Download poster') }
        subtitle={ t('Toggle download poster.') }
        IconComponent={ BookImage }
        value={ downloadsSavePoster }
        onChange={ (value) => onConfigUpdate('downloadsSavePoster', value) }
      />
    </ThemedScrollView>
  );

  const renderPlayer = () => (
    <ThemedScrollView>
      <SettingSelect
        title={ t('Player video quality') }
        IconComponent={ Settings2 }
        value={ playerQuality }
        options={ PLAYER_QUALITY_OPTIONS }
        onChange={ onPlayerQualityChange }
      />
      <SettingSwitch
        title={ t('Save player video quality') }
        subtitle={ t('Toggle save quality.') }
        IconComponent={ Pin }
        value={ playerSaveQuality }
        onChange={ (value) => onConfigUpdate('playerSaveQuality', value) }
      />
      <SettingSwitch
        title={ t('Ask quality') }
        subtitle={ t('Toggle ask quality.') }
        IconComponent={ CircleQuestionMark }
        value={ playerAskQuality }
        onChange={ (value) => onConfigUpdate('playerAskQuality', value) }
      />
      <SettingSelect
        title={ t('Player rewind seconds') }
        IconComponent={ Rewind }
        value={ playerRewindSeconds.toString() }
        options={ PLAYER_REWIND_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerRewindSeconds', Number(value)) }
      />
      <SettingSelect
        title={ t('Player default aspect ratio') }
        IconComponent={ Maximize2 }
        value={ playerDefaultAspectRatio }
        options={ PLAYER_ASPECT_RATIO_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerDefaultAspectRatio', value) }
      />
      <SettingSwitch
        title={ t('Auto next episode') }
        subtitle={ t('Toggle auto next episode.') }
        IconComponent={ StepForward }
        value={ playerAutoNextEpisode }
        onChange={ (value) => onConfigUpdate('playerAutoNextEpisode', value) }
      />
      <SettingSelect
        title={ t('Player long press speed') }
        IconComponent={ CircleGauge }
        value={ playerLongPressSpeed.toString() }
        options={ PLAYER_LONG_PRESS_SPEED_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerLongPressSpeed', Number(value)) }
      />
      <SettingSelect
        title={ t('Player default speed') }
        IconComponent={ Gauge }
        value={ playerDefaultSpeed.toString() }
        options={ PLAYER_SPEED_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerDefaultSpeed', Number(value)) }
      />
      <SettingSwitch
        title={ t('Show buffer time') }
        subtitle={ t('Toggle buffer time display.') }
        IconComponent={ LoaderCircle }
        value={ playerShowBufferTime }
        onChange={ (value) => onConfigUpdate('playerShowBufferTime', value) }
      />
      <SettingSwitch
        title={ t('Show end time') }
        subtitle={ t('Toggle end time display.') }
        IconComponent={ MoveRight }
        value={ playerShowEndTime }
        onChange={ (value) => onConfigUpdate('playerShowEndTime', value) }
      />
      <SettingSelect
        title={ t('Player buffer time settings') }
        IconComponent={ Loader }
        value={ playerBufferTimeSetting ? playerBufferTimeSetting.toString() : 'auto' }
        options={ PLAYER_BUFFER_TIME_OPTIONS }
        onChange={ (value) => onConfigUpdate(
          'playerBufferTimeSetting',
          value === 'auto' ? undefined : Number(value)
        ) }
      />
    </ThemedScrollView>
  );

  const renderAbout = () => (
    <ThemedScrollView>
      <SettingLink
        title='Telegram'
        subtitle={ t('Go to Telegram') }
        IconComponent={ TelegramIcon }
        iconProps={ {
          color: undefined,
          strokeWidth: 1,
          fill: theme.colors.icon,
          absoluteStrokeWidth: true,
        } }
        iconPropsFocused={ { fill: theme.colors.iconFocused } }
        imageLink={ require('../../../assets/images/telegram-qr.png') }
        onPress={ () => openLinkInBrowser(TELEGRAM_LINK) }
      />
      <SettingLink
        title='Github'
        subtitle={ t('Go to GitHub') }
        IconComponent={ GithubIcon }
        imageLink={ require('../../../assets/images/github-qr.png') }
        onPress={ () => openLinkInBrowser(GITHUB_LINK) }
      />
      <SettingText
        title={ t('App version') }
        subtitle={ appVersion }
        IconComponent={ Info }
        onPress={ onVersionPress }
      />
      <SettingSwitch
        title={ t('Check for updates') }
        subtitle={ t('Toggle check for updates.') }
        IconComponent={ RefreshCw }
        value={ checkForUpdates }
        onChange={ (value) => onConfigUpdate('checkForUpdates', value) }
      />
      <SettingSwitch
        title={ t('Time share') }
        subtitle={ t('Toggle time share. It will consume more data.') }
        IconComponent={ Cloud }
        value={ isFirestore }
        isHidden={ !securedSettings }
        onChange={ (value) => onConfigUpdate('isFirestore', value) }
      />
    </ThemedScrollView>
  );

  const renderCurrentGroup = () => {
    switch (currentGroup) {
      case SETTING_GROUP.APPEARANCE:
        return renderAppearance();
      case SETTING_GROUP.NETWORK:
        return renderNetwork();
      case SETTING_GROUP.DOWNLOADS:
        return renderDownloads();
      case SETTING_GROUP.PLAYER:
        return renderPlayer();
      case SETTING_GROUP.ABOUT:
        return renderAbout();
      default:
        return renderGroups();
    }
  };

  const renderTitle = () => {
    switch (currentGroup) {
      case SETTING_GROUP.APPEARANCE:
        return t('Appearance');
      case SETTING_GROUP.NETWORK:
        return t('Network');
      case SETTING_GROUP.DOWNLOADS:
        return t('Downloads');
      case SETTING_GROUP.PLAYER:
        return t('Player');
      case SETTING_GROUP.ABOUT:
        return t('About');
      default:
        return t('Settings');
    }
  };

  return (
    <Page checkConnection={ false }>
      <ThemedSafeArea>
        <Header
          title={ renderTitle() }
          onBack={ currentGroup ? handleBackToGroups : undefined }
        />
        <View style={ styles.content }>
          <Animated.View
            key={ currentGroup ?? 'groups' }
            entering={ FadeIn }
            exiting={ FadeOut }
            layout={ LinearTransition }
            style={ styles.page }
          >
            { renderCurrentGroup() }
          </Animated.View>
        </View>
      </ThemedSafeArea>
    </Page>
  );
}

export default SettingsScreenComponent;
