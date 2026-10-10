import ListVideo from 'lucide-react-native/icons/list-video';
import { Header } from 'Component/Header';
import { Page } from 'Component/Page';
import { getAspectRatio } from 'Component/Player/Player.config';
import { SettingBase } from 'Component/SettingBase';
import { SettingCustomSelect } from 'Component/SettingCustomSelect';
import { SettingExport } from 'Component/SettingExport';
import { SettingImport } from 'Component/SettingImport';
import { SettingInput } from 'Component/SettingInput';
import { SettingLink } from 'Component/SettingLink';
import { NavigationOrderSetting } from 'Component/NavigationOrderSetting';
import { getMobileNavigationOrderItems, getTVNavigationOrderItems } from '../../config/NavigationOrderOptions';
import { SettingMultiSelect } from 'Component/SettingMultiSelect';
import { SettingSelect } from 'Component/SettingSelect';

import { SettingSwitch } from 'Component/SettingSwitch';
import { SettingText } from 'Component/SettingText';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCloudSyncContext } from 'Context/CloudSyncContext';
import { normalizeAccentColor } from 'Theme/accentColors';
import { t } from 'i18n/translate';
import ALargeSmall from 'lucide-react-native/icons/a-large-small';
import AlignVerticalJustifyEnd from 'lucide-react-native/icons/align-vertical-justify-end';
import ArrowDown10 from 'lucide-react-native/icons/arrow-down-1-0';
import ArrowDownUp from 'lucide-react-native/icons/arrow-down-up';
import ArrowLeftRight from 'lucide-react-native/icons/arrow-left-right';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import ArrowUp from 'lucide-react-native/icons/arrow-up';
import AudioLines from 'lucide-react-native/icons/audio-lines';
import BookImage from 'lucide-react-native/icons/book-image';
import Bell from 'lucide-react-native/icons/bell';
import Brush from 'lucide-react-native/icons/brush';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import Subtitles from 'lucide-react-native/icons/captions';
import CircleGauge from 'lucide-react-native/icons/circle-gauge';
import CircleQuestionMark from 'lucide-react-native/icons/circle-question-mark';
import Cloud from 'lucide-react-native/icons/cloud';
import CloudCog from 'lucide-react-native/icons/cloud-cog';
import CloudOff from 'lucide-react-native/icons/cloud-off';
import DatabaseBackup from 'lucide-react-native/icons/database-backup';
import Dock from 'lucide-react-native/icons/dock';
import Download from 'lucide-react-native/icons/download';
import ExternalLink from 'lucide-react-native/icons/external-link';
import EyeOff from 'lucide-react-native/icons/eye-off';
import FastForward from 'lucide-react-native/icons/fast-forward';
import Film from 'lucide-react-native/icons/film';
import FolderCog from 'lucide-react-native/icons/folder-cog';
import FolderDown from 'lucide-react-native/icons/folder-down';
import FolderLock from 'lucide-react-native/icons/folder-lock';
import Gauge from 'lucide-react-native/icons/gauge';
import Globe from 'lucide-react-native/icons/globe';
import GlobeLock from 'lucide-react-native/icons/globe-lock';
import Grid3x2 from 'lucide-react-native/icons/grid-3x2';
import Highlighter from 'lucide-react-native/icons/highlighter';
import House from 'lucide-react-native/icons/house';
import Images from 'lucide-react-native/icons/images';
import Info from 'lucide-react-native/icons/info';
import Loader from 'lucide-react-native/icons/loader';
import LoaderCircle from 'lucide-react-native/icons/loader-circle';
import Maximize2 from 'lucide-react-native/icons/maximize-2';
import MessageSquarePlus from 'lucide-react-native/icons/message-square-plus';
import MoveRight from 'lucide-react-native/icons/move-right';
import MoveVertical from 'lucide-react-native/icons/move-vertical';
import PaintBucket from 'lucide-react-native/icons/paint-bucket';
import Palette from 'lucide-react-native/icons/palette';
import Pin from 'lucide-react-native/icons/pin';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Rewind from 'lucide-react-native/icons/rewind';
import Route from 'lucide-react-native/icons/route';
import Settings2 from 'lucide-react-native/icons/settings-2';
import ShieldAlert from 'lucide-react-native/icons/shield-alert';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import Sparkles from 'lucide-react-native/icons/sparkles';
import StepForward from 'lucide-react-native/icons/step-forward';
import Sun from 'lucide-react-native/icons/sun';
import Tag from 'lucide-react-native/icons/tag';
import Timer from 'lucide-react-native/icons/timer';
import TvMinimalPlay from 'lucide-react-native/icons/tv-minimal-play';
import UserCog from 'lucide-react-native/icons/user-cog';
import UserRound from 'lucide-react-native/icons/user-round';
import Users from 'lucide-react-native/icons/users';
import Volume2 from 'lucide-react-native/icons/volume-2';
import { reactNativeDownloads } from 'Modules/react-native-downloads';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { GithubIcon, TelegramIcon } from 'Theme/icons';
import { openLinkInBrowser } from 'Util/Link';

import {
  APP_LANGUAGE_OPTIONS,
  COLUMNS_MOBILE_OPTIONS,
  TAB_POSITION_OPTIONS,
  FILM_COUNTRY_OPTIONS,
  GITHUB_LINK,
  MOBILE_NAVIGATION_OPTIONS,
  MOBILE_SCREENS,
  PLAYER_ASPECT_RATIO_OPTIONS,
  PLAYER_BACK_BUFFER_TIME_OPTIONS,
  PLAYER_BUFFER_TIME_OPTIONS,
  PLAYER_GESTURE_STEP_OPTIONS,
  PLAYER_LONG_PRESS_SPEED_OPTIONS,
  PLAYER_QUALITY_OPTIONS,
  PLAYER_REWIND_OPTIONS,
  PLAYER_SPEED_OPTIONS,
  PLAYER_SUBTITLES_BACKGROUND_OPTIONS,
  PLAYER_SUBTITLES_BOTTOM_OFFSET_OPTIONS,
  PLAYER_SUBTITLES_COLOR_OPTIONS,
  PLAYER_SUBTITLES_EDGE_OPTIONS,
  PLAYER_SUBTITLES_SIZE_OPTIONS,
  PLAYER_VOLUME_NORMALIZATION_OPTIONS,
  TELEGRAM_LINK,
  THEME_SCHEME_OPTIONS,
  TV_NAVIGATION_OPTIONS,
} from './SettingsScreen.config';
import { handOverGroup, takeHandedOverGroup } from './SettingsScreen.reload';
import { componentStyles } from './SettingsScreen.style';
import { SETTING_GROUP, SettingsScreenComponentProps } from './SettingsScreen.type';
import { useTripleTap } from './useTripleTap';

export function SettingsScreenComponent({
  initialRoute,
  showRatings,
  showAccountAvatar,
  newHomeInterface,
  showRecentNotifications,
  homeDefaultTab,
  homeTabOrder,
  hiddenHomeTabs,
  showEpisodeUpdateCount,
  homeDisplayMode,
  bookmarksDisplayMode,
  recentDisplayMode,
  tabPosition,
  numberOfColumnsMobile,
  hiddenCountries,
  playerRewindSeconds,
  playerBackwardRewindSeconds,
  playerShowBufferTime,
  playerShowEndTime,
  playerShowEpisodeName,
  playerShowEpisodeDate,
  playerSubtitlesCustomStyle,
  playerSubtitlesSizeScale,
  playerSubtitlesColor,
  playerSubtitlesBackgroundColor,
  playerSubtitlesEdgeType,
  playerSubtitlesBottomOffset,
  playerStoryboard,
  playerStoryboardAdjacentFrames,
  isFirestore,
  securedSettings,
  downloadsPath,
  downloadsSaveSubtitles,
  downloadsSavePoster,
  downloadsMaxParallel,
  downloadsMaxParallelOptions,
  playerAutoNextEpisode,
  playerKeepTimeOnVoiceChange,
  playerLongPressSpeed,
  playerVolumeGesture,
  playerBrightnessGesture,
  playerSwapGestureSides,
  playerGestureStep,
  playerSaveBrightness,
  playerVolumeNormalizationEnabled,
  playerVolumeNormalizationStrength,
  isVolumeNormalizationSupported,
  sortVoicesByRating,
  playerBufferTimeSetting,
  playerBackBufferTimeSetting,
  checkForUpdates,
  playerSaveQuality,
  playerAskQuality,
  playerCompactSelector,
  strictConnectionCheck,
  playerDefaultAspectRatio,
  playerDefaultSpeed,
  isContinueBtnEnabled,
  isLocalLibrary,
  commentPostingMobile,
  scrollToTopButtonEnabled,
  showVotesCount,
  showBookmarkCounts,
  showRecommendations,
  showAgeRating,
  theme,
  themeScheme,
  isTV,
  accentColor,
  tvNavigationOrder,
  hiddenTVNavigationTabs,
  mobileNavigationOrder,
  hiddenMobileNavigationTabs,
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
  homeMenuOptions,
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
  const {
    connected: cloudSyncConnected,
    email: cloudSyncEmail,
    lastSyncAt: cloudSyncLastSyncAt,
    lastError: cloudSyncLastError,
    syncing: cloudSyncSyncing,
    connect: connectCloudSync,
    disconnect: disconnectCloudSync,
    syncNow: syncCloudSync,
  } = useCloudSyncContext();
  const styles = useThemedStyles(componentStyles);
  const [currentGroup, setCurrentGroup] = useState<SETTING_GROUP | null>(takeHandedOverGroup);
  const [navigationOrderEditor, setNavigationOrderEditor] = useState<'tv' | 'mobile' | 'home' | null>(null);

  const handleOpenGroup = useCallback((group: SETTING_GROUP) => {
    setCurrentGroup(group);
  }, []);

  // the change remounts the screen tree, so the open group has to be handed over first
  const handleLanguageChange = useCallback((value: string) => {
    handOverGroup(currentGroup);

    return onLanguageChange(value);
  }, [currentGroup, onLanguageChange]);

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
        title={ t('Import/Export') }
        IconComponent={ DatabaseBackup }
        onPress={ () => handleOpenGroup(SETTING_GROUP.BACKUP) }
      />
      <SettingBase
        title={ t('About') }
        IconComponent={ Info }
        onPress={ () => handleOpenGroup(SETTING_GROUP.ABOUT) }
      />
    </ThemedScrollView>
  );

  const onAccentColorInput = useCallback(async (value: string) => {
    const normalized = normalizeAccentColor(value.startsWith('#') ? value : '#' + value);

    if (!normalized) {
      return false;
    }

    onConfigUpdate('accentColor', normalized);
    return true;
  }, [onConfigUpdate]);

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
        title={ t('Interface mode') }
        IconComponent={ TvMinimalPlay }
        value={ isTV ? 'tv' : 'mobile' }
        options={ [
          { value: 'mobile', label: t('Mobile Version') },
          { value: 'tv', label: t('TV Version') },
        ] }
        onChange={ (value) => onConfigUpdate('isTV', value === 'tv') }
      />
      <SettingSelect
        title={ t('Accent color') }
        IconComponent={ Palette }
        value={ accentColor.startsWith('#') ? 'custom' : accentColor }
        options={ [
          { value: 'default', label: t('Default') },
          { value: 'blue', label: t('Blue') },
          { value: 'green', label: t('Green') },
          { value: 'purple', label: t('Purple') },
          { value: 'orange', label: t('Orange') },
          { value: 'red', label: t('Red') },
          { value: 'custom', label: t('Custom') },
        ] }
        customValue={ accentColor.startsWith('#') ? accentColor : '' }
        customInputTitle={ t('Custom') }
        onChange={ (value) => value === 'custom'
          ? onConfigUpdate('accentColor', accentColor.startsWith('#') ? accentColor : '#')
          : onConfigUpdate('accentColor', value) }
        onCustomChange={ onAccentColorInput }
      />
      { !isTV && (
        <>
          <SettingBase
            title={ t('Mobile navigation order') }
            IconComponent={ Dock }
            onPress={ () => setNavigationOrderEditor('mobile') }
          />
          <SettingSwitch
            title={ t('New home interface') }
            subtitle={ t('Move Settings to Home and allow sorting or hiding the Account tab.') }
            IconComponent={ Settings2 }
            value={ newHomeInterface }
            onChange={ (value) => onConfigUpdate('newHomeInterface', value) }
          />
          <SettingSwitch
            title={ t('Episode updates in Recent') }
            subtitle={ t('Show the episode update button in the top-right corner of Recent.') }
            IconComponent={ Bell }
            value={ showRecentNotifications }
            onChange={ (value) => onConfigUpdate('showRecentNotifications', value) }
          />
        </>
      ) }
      <SettingSelect
        title={ t('Interface language') }
        IconComponent={ Globe }
        value={ appLanguage }
        options={ APP_LANGUAGE_OPTIONS }
        onChange={ handleLanguageChange }
      />
      <SettingSelect
        title={ t('Initial route') }
        IconComponent={ Route }
        value={ initialRoute }
        options={ MOBILE_SCREENS }
        onChange={ (value) => onConfigUpdate('initialRoute', value) }
      />
      <SettingBase
        title={ t('Default home tab') }
        subtitle="Измените порядок и видимость вкладок. Первая видимая вкладка открывается при запуске."
        IconComponent={ House }
        onPress={ () => setNavigationOrderEditor('home') }
      />
      <SettingSelect
        title={ t('Tab position') }
        IconComponent={ MoveVertical }
        value={ tabPosition }
        options={ TAB_POSITION_OPTIONS }
        onChange={ (value) => onConfigUpdate('tabPosition', value) }
      />
      <SettingSwitch
        title={ t('Show ratings') }
        subtitle={ t('Show movie ratings on posters.') }
        IconComponent={ Tag }
        value={ showRatings }
        onChange={ (value) => onConfigUpdate('showRatings', value) }
      />
      <SettingSwitch
        title={ t('Show account avatar') }
        subtitle={ t('Show your account avatar instead of the account icon.') }
        IconComponent={ UserRound }
        value={ showAccountAvatar }
        onChange={ (value) => onConfigUpdate('showAccountAvatar', value) }
      />
      <SettingSelect
        title={ t('Columns in list') }
        IconComponent={ Grid3x2 }
        value={ numberOfColumnsMobile.toString() }
        options={ COLUMNS_MOBILE_OPTIONS }
        onChange={ (value) => onConfigUpdate('numberOfColumnsMobile', Number(value)) }
      />
      <SettingSelect
        title={ t('Home display mode') }
        IconComponent={ Grid3x2 }
        value={ homeDisplayMode }
        options={ [
          { value: 'grid', label: t('Grid') },
          { value: 'list', label: t('List') },
        ] }
        onChange={ (value) => onConfigUpdate('homeDisplayMode', value) }
      />
      <SettingSelect
        title={ t('Bookmarks display mode') }
        IconComponent={ Grid3x2 }
        value={ bookmarksDisplayMode }
        options={ [
          { value: 'grid', label: t('Grid') },
          { value: 'list', label: t('List') },
        ] }
        onChange={ (value) => onConfigUpdate('bookmarksDisplayMode', value) }
      />
      <SettingSelect
        title={ t('Recent display mode') }
        IconComponent={ Grid3x2 }
        value={ recentDisplayMode }
        options={ [
          { value: 'grid', label: t('Grid') },
          { value: 'list', label: t('List') },
        ] }
        onChange={ (value) => onConfigUpdate('recentDisplayMode', value) }
      />
      <SettingMultiSelect
        title={ t('Hidden countries') }
        subtitle={ t('Cover up films from the selected countries in the lists.') }
        IconComponent={ EyeOff }
        values={ hiddenCountries }
        options={ FILM_COUNTRY_OPTIONS }
        withSearch
        onChange={ (values) => onConfigUpdate('hiddenCountries', values) }
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
        title={ t('Show votes count') }
        subtitle={ t('Show how many votes a rating is made of, next to it.') }
        IconComponent={ Users }
        value={ showVotesCount }
        onChange={ (value) => onConfigUpdate('showVotesCount', value) }
      />
      <SettingSwitch
        title="Количество обновлений серий"
        subtitle="Показывать число обновлений в скобках рядом с вкладкой «Обновление серий» в новом мобильном интерфейсе."
        IconComponent={ CalendarDays }
        value={ showEpisodeUpdateCount }
        onChange={ (value) => onConfigUpdate('showEpisodeUpdateCount', value) }
      />
      <SettingSwitch
        title={ t('Show bookmark counts') }
        subtitle={ t('Show the number of films in each bookmark category.') }
        IconComponent={ Users }
        value={ showBookmarkCounts }
        onChange={ (value) => onConfigUpdate('showBookmarkCounts', value) }
      />
      <SettingSwitch
        title={ t('Recommendations') }
        subtitle={ t('Show similar films at the bottom of a film page.') }
        IconComponent={ Sparkles }
        value={ showRecommendations }
        onChange={ (value) => onConfigUpdate('showRecommendations', value) }
      />
      <SettingSwitch
        title={ t('Show age rating') }
        subtitle={ t('Show the age a film is rated for on its page.') }
        IconComponent={ ShieldAlert }
        value={ showAgeRating }
        onChange={ (value) => onConfigUpdate('showAgeRating', value) }
      />
      <SettingSwitch
        title={ t('Continue button enabled') }
        subtitle={ t('Toggle continue button.') }
        IconComponent={ ArrowRight }
        value={ isContinueBtnEnabled }
        onChange={ (value) => onConfigUpdate('isContinueBtnEnabled', value) }
      />
      <SettingSwitch
        title={ t('Enable ability to add comments') }
        subtitle={ t('Toggle writing comments and replies.') }
        IconComponent={ MessageSquarePlus }
        value={ commentPostingMobile }
        onChange={ (value) => onConfigUpdate('commentPostingMobile', value) }
      />
      <SettingSwitch
        title={ t('Scroll to top button') }
        subtitle={ t('Show a floating button to jump back to the top after scrolling down.') }
        IconComponent={ ArrowUp }
        value={ scrollToTopButtonEnabled }
        onChange={ (value) => onConfigUpdate('scrollToTopButtonEnabled', value) }
      />
    </ThemedScrollView>
  );

  const renderNetwork = () => (
    <ThemedScrollView>
        <SettingBase
        title={ t('Google Drive sync') }
        subtitle={
          cloudSyncConnected
            ? cloudSyncEmail
              ? `Connected as ${cloudSyncEmail}`
              : t('Google account connected')
            : t('Not connected')
        }
        IconComponent={ cloudSyncConnected ? Cloud : CloudOff }
        onPress={ cloudSyncConnected ? disconnectCloudSync : connectCloudSync }
        withLoader
      />
      <SettingBase
        title={ t('Sync now') }
        subtitle={
          cloudSyncLastError
            ? cloudSyncLastError
            : cloudSyncLastSyncAt
              ? `Last synced: ${new Date(cloudSyncLastSyncAt).toLocaleString()}`
              : t('Synchronize your data with Google Drive.')
        }
        IconComponent={ RefreshCw }
        isEnabled={ cloudSyncConnected && !cloudSyncSyncing }
        onPress={ syncCloudSync }
        withLoader
        isLoading={ cloudSyncSyncing }
      />
      <SettingSwitch
        title={ t('Official mode') }
        subtitle={ t('Links will be used as in the official application.') }
        IconComponent={ ShieldCheck }
        value={ officialMode }
        confirmation={ {
          title: t('Are you sure?'),
          message: t('Log in to use official mode, otherwise, films won\'t load. Please wait a bit after enabling.'),
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
      <SettingCustomSelect
        title={ t('Official mode share link') }
        IconComponent={ ExternalLink }
        value={ officialShareLink }
        options={ providerOptions }
        isEnabled={ officialMode }
        onChange={ onOfficialShareLinkChange }
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
      <SettingSelect
        title={ t('Parallel downloads') }
        subtitle={ t('How many files are downloaded at the same time. The rest wait in a queue.') }
        IconComponent={ ArrowDownUp }
        value={ String(downloadsMaxParallel) }
        options={ downloadsMaxParallelOptions }
        onChange={ (value) => onConfigUpdate('downloadsMaxParallel', Number(value)) }
      />
    </ThemedScrollView>
  );

  /**
   * The look of the subtitles the player draws. It is styled natively (see
   * `useSubtitleStyle`), so nothing here is previewed - the switch is what decides
   * between these settings and whatever the device's own captioning settings say.
   */
  const renderSubtitlesStyle = () => (
    <>
      <SettingSwitch
        title={ t('Custom subtitles style') }
        subtitle={ t('Style the subtitles here instead of following the system captioning settings.') }
        IconComponent={ Subtitles }
        value={ playerSubtitlesCustomStyle }
        onChange={ (value) => onConfigUpdate('playerSubtitlesCustomStyle', value) }
      />
      <SettingSelect
        title={ t('Subtitles size') }
        subtitle={ t('Relative to the size of the picture, so it holds at any resolution.') }
        IconComponent={ ALargeSmall }
        value={ playerSubtitlesSizeScale.toString() }
        options={ PLAYER_SUBTITLES_SIZE_OPTIONS }
        isEnabled={ playerSubtitlesCustomStyle }
        onChange={ (value) => onConfigUpdate('playerSubtitlesSizeScale', Number(value)) }
      />
      <SettingSelect
        title={ t('Subtitles color') }
        IconComponent={ Palette }
        value={ playerSubtitlesColor }
        options={ PLAYER_SUBTITLES_COLOR_OPTIONS }
        isEnabled={ playerSubtitlesCustomStyle }
        onChange={ (value) => onConfigUpdate('playerSubtitlesColor', value) }
      />
      <SettingSelect
        title={ t('Subtitles background') }
        IconComponent={ PaintBucket }
        value={ playerSubtitlesBackgroundColor }
        options={ PLAYER_SUBTITLES_BACKGROUND_OPTIONS }
        isEnabled={ playerSubtitlesCustomStyle }
        onChange={ (value) => onConfigUpdate('playerSubtitlesBackgroundColor', value) }
      />
      <SettingSelect
        title={ t('Subtitles outline') }
        subtitle={ t('What separates the letters from the picture behind them.') }
        IconComponent={ Highlighter }
        value={ playerSubtitlesEdgeType }
        options={ PLAYER_SUBTITLES_EDGE_OPTIONS }
        isEnabled={ playerSubtitlesCustomStyle }
        onChange={ (value) => onConfigUpdate('playerSubtitlesEdgeType', value) }
      />
      <SettingSelect
        title={ t('Subtitles position') }
        subtitle={ t('How much of the picture stands between the subtitles and its bottom edge.') }
        IconComponent={ AlignVerticalJustifyEnd }
        value={ playerSubtitlesBottomOffset.toString() }
        options={ PLAYER_SUBTITLES_BOTTOM_OFFSET_OPTIONS }
        isEnabled={ playerSubtitlesCustomStyle }
        onChange={ (value) => onConfigUpdate('playerSubtitlesBottomOffset', Number(value)) }
      />
    </>
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
      <SettingSwitch
        title={ t('Compact season and episode selector') }
        subtitle={ t('Use dropdowns instead of buttons to choose the season and episode.') }
        IconComponent={ ListVideo }
        value={ playerCompactSelector }
        onChange={ (value) => onConfigUpdate('playerCompactSelector', value) }
      />
      <SettingSelect
        title={ t('Player forward rewind seconds') }
        IconComponent={ FastForward }
        value={ playerRewindSeconds.toString() }
        options={ PLAYER_REWIND_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerRewindSeconds', Number(value)) }
      />
      <SettingSelect
        title={ t('Player backward rewind seconds') }
        IconComponent={ Rewind }
        value={ playerBackwardRewindSeconds.toString() }
        options={ PLAYER_REWIND_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerBackwardRewindSeconds', Number(value)) }
      />
      <SettingSwitch
        title={ t('Preview frames') }
        subtitle={ t('Show a frame of the video at the position being sought to.') }
        IconComponent={ Film }
        value={ playerStoryboard }
        onChange={ (value) => onConfigUpdate('playerStoryboard', value) }
      />
      <SettingSwitch
        title={ t('Adjacent preview frames') }
        subtitle={ t('Show the previous and the next preview frame beside the current one while seeking.') }
        IconComponent={ Images }
        value={ playerStoryboardAdjacentFrames }
        isEnabled={ playerStoryboard }
        onChange={ (value) => onConfigUpdate('playerStoryboardAdjacentFrames', value) }
      />
      <SettingSelect
        title={ t('Player default aspect ratio') }
        IconComponent={ Maximize2 }
        value={ getAspectRatio(playerDefaultAspectRatio) }
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
      <SettingSwitch
        title={ t('Keep time on voice change') }
        subtitle={ t('Switching the voice keeps the current position instead of the one saved for it.') }
        IconComponent={ Timer }
        value={ playerKeepTimeOnVoiceChange }
        onChange={ (value) => onConfigUpdate('playerKeepTimeOnVoiceChange', value) }
      />
      <SettingSelect
        title={ t('Player long press speed') }
        IconComponent={ CircleGauge }
        value={ playerLongPressSpeed.toString() }
        options={ PLAYER_LONG_PRESS_SPEED_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerLongPressSpeed', Number(value)) }
      />
      <SettingSwitch
        title={ t('Volume gesture') }
        subtitle={ t('Slide up and down on the right half of the player to change the volume.') }
        IconComponent={ Volume2 }
        value={ playerVolumeGesture }
        onChange={ (value) => onConfigUpdate('playerVolumeGesture', value) }
      />
      <SettingSwitch
        title={ t('Brightness gesture') }
        subtitle={ t('Slide up and down on the left half of the player to change the screen brightness.') }
        IconComponent={ Sun }
        value={ playerBrightnessGesture }
        onChange={ (value) => onConfigUpdate('playerBrightnessGesture', value) }
      />
      { /* with only one of the two on it owns the whole width, so there are no sides to swap */ }
      <SettingSwitch
        title={ t('Swap gesture sides') }
        subtitle={ t('Put the volume on the left half of the player and the brightness on the right.') }
        IconComponent={ ArrowLeftRight }
        value={ playerSwapGestureSides }
        isEnabled={ playerVolumeGesture && playerBrightnessGesture }
        onChange={ (value) => onConfigUpdate('playerSwapGestureSides', value) }
      />
      <SettingSelect
        title={ t('Gesture step') }
        subtitle={ t('How far the volume or the brightness moves for the same swipe.') }
        IconComponent={ MoveVertical }
        value={ playerGestureStep.toString() }
        options={ PLAYER_GESTURE_STEP_OPTIONS }
        isEnabled={ playerVolumeGesture || playerBrightnessGesture }
        onChange={ (value) => onConfigUpdate('playerGestureStep', Number(value)) }
      />
      <SettingSwitch
        title={ t('Remember brightness') }
        subtitle={ t('Open the player at the brightness it was last left at.') }
        IconComponent={ Pin }
        value={ playerSaveBrightness }
        isEnabled={ playerBrightnessGesture }
        onChange={ (value) => onConfigUpdate('playerSaveBrightness', value) }
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
      <SettingSwitch
        title={ t('Show episode name') }
        subtitle={ t('Show the name the schedule gives the episode under the title in the player.') }
        IconComponent={ Tag }
        value={ playerShowEpisodeName }
        onChange={ (value) => onConfigUpdate('playerShowEpisodeName', value) }
      />
      <SettingSwitch
        title={ t('Show episode date') }
        subtitle={ t('Append the air date to the episode name, as "name (date)".') }
        IconComponent={ CalendarDays }
        value={ playerShowEpisodeDate }
        isEnabled={ playerShowEpisodeName }
        onChange={ (value) => onConfigUpdate('playerShowEpisodeDate', value) }
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
      <SettingSelect
        title={ t('Player rewind buffer') }
        subtitle={ t('How much played video is kept in memory so rewinding does not reload it.') }
        IconComponent={ Rewind }
        value={ playerBackBufferTimeSetting.toString() }
        options={ PLAYER_BACK_BUFFER_TIME_OPTIONS }
        onChange={ (value) => onConfigUpdate('playerBackBufferTimeSetting', Number(value)) }
      />
      <SettingSwitch
        title={ t('Volume normalization') }
        subtitle={ t('Adds a button to the player that makes loud scenes quieter and quiet dialogue louder.') }
        IconComponent={ AudioLines }
        value={ playerVolumeNormalizationEnabled }
        isHidden={ !isVolumeNormalizationSupported }
        onChange={ (value) => onConfigUpdate('playerVolumeNormalizationEnabled', value) }
      />
      <SettingSelect
        title={ t('Normalization strength') }
        subtitle={ t('How close together the loudest and the quietest parts are brought.') }
        IconComponent={ Gauge }
        value={ playerVolumeNormalizationStrength }
        options={ PLAYER_VOLUME_NORMALIZATION_OPTIONS }
        isHidden={ !isVolumeNormalizationSupported }
        isEnabled={ playerVolumeNormalizationEnabled }
        onChange={ (value) => onConfigUpdate('playerVolumeNormalizationStrength', value) }
      />
      { renderSubtitlesStyle() }
    </ThemedScrollView>
  );

  const renderBackup = () => (
    <ThemedScrollView>
      <SettingExport />
      <SettingImport />
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
      case SETTING_GROUP.BACKUP:
        return renderBackup();
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
      case SETTING_GROUP.BACKUP:
        return t('Import/Export');
      case SETTING_GROUP.ABOUT:
        return t('About');
      default:
        return t('Settings');
    }
  };

  if (navigationOrderEditor === 'home') {
    return (
      <NavigationOrderSetting
        title={ t('Default home tab') }
        items={ homeMenuOptions.map((item) => ({ ...item, IconComponent: House })) }
        value={ homeTabOrder }
        hiddenItems={ hiddenHomeTabs }
        onChange={ (value) => onConfigUpdate('homeTabOrder', value) }
        onHiddenItemsChange={ (value) => onConfigUpdate('hiddenHomeTabs', value) }
        onBack={ () => setNavigationOrderEditor(null) }
      />
    );
  }
  if (navigationOrderEditor) {
    const isTVNavigation = navigationOrderEditor === 'tv';

    return (
      <NavigationOrderSetting
        title={ isTVNavigation ? t('TV navigation order') : t('Mobile navigation order') }
        items={
          isTVNavigation
            ? getTVNavigationOrderItems()
            : getMobileNavigationOrderItems(newHomeInterface)
        }
        value={ isTVNavigation ? tvNavigationOrder : mobileNavigationOrder }
        hiddenItems={ isTVNavigation ? hiddenTVNavigationTabs : hiddenMobileNavigationTabs }
        onHiddenItemsChange={ (value) =>
          onConfigUpdate(
            isTVNavigation ? 'hiddenTVNavigationTabs' : 'hiddenMobileNavigationTabs',
            value,
          )
        }
        onChange={ (value) =>
          onConfigUpdate(
            isTVNavigation ? 'tvNavigationOrder' : 'mobileNavigationOrder',
            value,
          )
        }
        onBack={ () => setNavigationOrderEditor(null) }
      />
    );
  }
  return (
    <Page checkConnection={ false }>
      <ThemedSafeArea>
        <Header
          title={ renderTitle() }
          disableBackRipple
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
