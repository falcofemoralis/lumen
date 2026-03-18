import { ASPECT_RATIO_OPTIONS, DEFAULT_SPEEDS, getAspectRatioLabel, MAX_QUALITY } from 'Component/Player/Player.config';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import { t } from 'i18n/translate';
import {
  ArrowDown10,
  Blend,
  BookImage,
  Brush,
  CircleArrowRight,
  CircleGauge,
  CircleQuestionMark,
  Cloud,
  CloudCog,
  Download,
  ExternalLink,
  FolderCog,
  FolderDown,
  FolderLock,
  Gauge,
  Globe,
  GlobeLock,
  Grid3x2,
  Info,
  Loader,
  LoaderCircle,
  Maximize2,
  MonitorPlay,
  MoveRight,
  Palette,
  Pin,
  RefreshCw,
  Rewind,
  Route,
  Settings2,
  ShieldCheck,
  StepForward,
  Subtitles,
  TvMinimalPlay,
  UserCog,
} from 'lucide-react-native';
import { reactNativeDownloads } from 'Modules/react-native-downloads';
import { useState } from 'react';
import { useTripleTap } from 'Screen/SettingsScreen/useTripleTap';
import { TEST_URL } from 'Screen/WelcomeScreen/WelcomeScreen.config';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { GithubIcon, TelegramIcon } from 'Theme/icons';
import { ThemeContextModeT } from 'Theme/types';
import { restartApp } from 'Util/Device';
import { openLinkInBrowser } from 'Util/Link';
import { setTimeoutSafe } from 'Util/Misc';
import { getPlayerQuality, updatePlayerQuality } from 'Util/Player';
import { convertBooleanToString, convertStringToBoolean, convertStringToNumber } from 'Util/Type';

import SettingsScreenComponent from './SettingsScreen.component';
import SettingsScreenComponentTV from './SettingsScreen.component.atv';
import {
  GITHUB_LINK,
  MOBILE_SCREENS,
  TELEGRAM_LINK,
  TV_SCREENS,
  updateSettings,
  yesNoOptions,
} from './SettingsScreen.config';
import { SETTING_TYPE, SettingItem } from './SettingsScreen.type';

export function SettingsScreenContainer() {
  const {
    setConfig,
    isTV,
    initialRoute,
    numberOfColumnsMobile,
    numberOfColumnsTV,
    isTVGridAnimation,
    isTVAwake,
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
    playerStopPlayOnButtonTV,
    playerBufferTimeSetting,
    checkForUpdates,
    playerSaveQuality,
    playerAskQuality,
    strictConnectionCheck,
    playerDefaultAspectRatio,
    playerDefaultSpeed,
  } = useConfigContext();
  const {
    currentService,
    updateOfficialMode,
    updateProvider,
    updateAutomaticCDN,
    updateCDN,
    updateUserAgent,
    reLogin,
    validateUrl,
  } = useServiceContext();
  const { theme, themeScheme, setThemeContextOverride } = useAppTheme();
  const { handleTap } = useTripleTap();

  const onSettingPress = (value: string | null, key: any) => {
    setConfig(key, convertStringToBoolean(convertStringToNumber(value)));
  };

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'appearance-group',
      type: SETTING_TYPE.GROUP,
      title: t('Appearance'),
      IconComponent: Palette,
      settings: [
        {
          id: 'themeScheme',
          title: t('Theme scheme'),
          type: SETTING_TYPE.SELECT,
          value: !themeScheme ? 'system' : themeScheme,
          options: [
            { value: 'system', label: t('System default') },
            { value: 'dark', label: t('Dark') },
            { value: 'light', label: t('Light') },
          ],
          IconComponent: Brush,
          onSettingPress: (value) => {
            setTimeoutSafe(() => {
              setThemeContextOverride((value as string) === 'system' ? undefined : (value as ThemeContextModeT));
            }, 50);
          },
        },
        {
          id: 'initialRoute',
          title: t('Initial route'),
          type: SETTING_TYPE.SELECT,
          value: initialRoute,
          options: isTV ? TV_SCREENS : MOBILE_SCREENS,
          IconComponent: Route,
          onSettingPress,
        },
        {
          id: 'numberOfColumnsMobile',
          title: t('Columns in list'),
          type: SETTING_TYPE.SELECT,
          value: numberOfColumnsMobile.toString(),
          options: Array.from({ length: 9 }, (_, index) => ({
            value: (index + 2).toString(),
            label: (index + 2).toString(),
          })),
          IconComponent: Grid3x2,
          onSettingPress,
          isHidden: isTV,
        },
        {
          id: 'numberOfColumnsTV',
          title: t('Columns in list'),
          type: SETTING_TYPE.SELECT,
          value: numberOfColumnsTV.toString(),
          options: Array.from({ length: 11 }, (_, index) => ({
            value: (index + 2).toString(),
            label: (index + 2).toString(),
          })),
          IconComponent: Grid3x2,
          onSettingPress: (value, key) => {
            setConfig(key, Number(value));
            NotificationStore.displayMessage(t('Restart app to apply changes.'));
            setTimeoutSafe(() => {
              restartApp();
            }, 2000);
          },
          isHidden: !isTV,
        },
        {
          id: 'isTVGridAnimation',
          title: t('Grid animation'),
          subtitle: t('Toggle grid animation.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(isTVGridAnimation),
          options: yesNoOptions,
          IconComponent: Blend,
          onSettingPress,
          isHidden: !isTV,
        },
        {
          id: 'isTVAwake',
          title: t('TV awake'),
          subtitle: t('Toggle TV awake.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(isTVAwake),
          options: yesNoOptions,
          IconComponent: MonitorPlay,
          onSettingPress,
          isHidden: !isTV,
        },
        {
          id: 'sortVoicesByRating',
          title: t('Sort voices by rating'),
          subtitle: t('Toggle sorting voices by rating.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(sortVoicesByRating),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: ArrowDown10,
        },
      ],
    },
    {
      id: 'network-group',
      type: SETTING_TYPE.GROUP,
      title: t('Network'),
      IconComponent: Globe,
      settings: [
        {
          id: 'officialMode',
          title: t('Official mode'),
          subtitle: t('Links will be used as in the official application.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(currentService.isOfficialMode()),
          IconComponent: ShieldCheck,
          onSettingPress: async (value) => {
            try {
              updateOfficialMode(convertStringToBoolean(value));

              await reLogin();
            } catch (error) {
              NotificationStore.displayError(error as Error);

              return false;
            }

            return true;
          },
          confirmation: {
            title: t('Are you sure?'),
            message: t('Please wait a bit after enabling.'),
          },
          withLoader: true,
        },
        {
          id: 'provider',
          title: t('Provider'),
          type: SETTING_TYPE.CUSTOM_SELECT,
          value: currentService.getDefaultProvider(),
          options: currentService.defaultProviders.map((provider) => ({
            value: provider,
            label: provider,
          })),
          onSettingPress: async (value) => {
            try {
              await validateUrl(value as string);

              updateProvider(value as string);

              await reLogin();
            } catch (error) {
              NotificationStore.displayError(error as Error);

              return false;
            }

            return true;
          },
          IconComponent: CloudCog,
          confirmation: {
            title: t('Are you sure?'),
            message: t('Please wait a bit after enabling.'),
          },
          withLoader: true,
        },
        {
          id: 'officialModeShareLink',
          title: t('Official mode share link'),
          type: SETTING_TYPE.CUSTOM_SELECT,
          value: currentService.getOfficialShareLink(),
          options: currentService.defaultProviders.map((provider) => ({
            value: provider,
            label: provider,
          })),
          onSettingPress: async (value) => {
            currentService.setOfficialShareLink(value as string);
          },
          IconComponent: ExternalLink,
          dependsOn: {
            field: 'officialMode',
            value: 'true',
          },
        },
        {
          id: 'automaticCDN',
          title: t('Automatic CDN'),
          subtitle: t('Toggle automatic CDN usage.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(currentService.isAutomaticCDN()),
          IconComponent: FolderLock,
          onSettingPress: async (value) => {
            updateAutomaticCDN(convertStringToBoolean(value));
          },
          confirmation: {
            title: t('Are you sure?'),
          },
          withLoader: true,
        },
        {
          id: 'cdn',
          title: t('CDN'),
          type: SETTING_TYPE.CUSTOM_SELECT,
          value: currentService.getCDN(),
          options: currentService.defaultCDNs.map((cdn) => ({
            value: cdn,
            label: cdn,
          })),
          onSettingPress: async (value) => {
            try {
              updateCDN(value as string);

              const film = await currentService.getFilm(TEST_URL);
              if (!film) {
                throw new Error('Film is not available with the selected CDN');
              }

              const { voices } = film;

              if (!voices.length
                    || !voices[0].video
                    || !voices[0].video.streams.length
              ) {
                throw new Error('Something went wrong');
              }

              const { url } = currentService.modifyCDN(voices[0].video.streams)[0];

              await validateUrl((new URL(url)).origin);
            } catch (error) {
              NotificationStore.displayError(error as Error);

              return false;
            }

            return true;
          },
          IconComponent: FolderCog,
          dependsOn: {
            field: 'automaticCDN',
            value: 'false',
          },
          confirmation: {
            title: t('Are you sure?'),
            message: t('Please wait a bit after enabling.'),
          },
          withLoader: true,
        },
        {
          id: 'strictConnectionCheck',
          title: t('Strict connection check'),
          subtitle: t('Toggle strict connection check.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(strictConnectionCheck),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: GlobeLock,
        },
        {
          id: 'userAgent',
          title: t('Useragent'),
          type: SETTING_TYPE.INPUT,
          value: currentService.getUserAgent(),
          IconComponent: UserCog,
          onSettingPress: (value) => updateUserAgent(value as string),
        },
      ],
    },
    {
      id: 'downloads-group',
      type: SETTING_TYPE.GROUP,
      title: t('Downloads'),
      IconComponent: Download,
      settings: [
        {
          id: 'downloadsPath',
          title: t('Downloads path'),
          type: SETTING_TYPE.SELECT,
          value: downloadsPath ?? reactNativeDownloads.getDefaultDownloadDirectory(),
          options: reactNativeDownloads.getDownloadsDirectories().map((dir) => ({
            value: dir.downloadsPath,
            label: dir.isPrimary ? 'Internal storage' : (dir.isRemovable ? 'SD Card' : 'External storage'),
          })),
          IconComponent: FolderDown,
          onSettingPress,
        },
        {
          id: 'downloadsSaveSubtitles',
          title: t('Download subtitles'),
          subtitle: t('Toggle download subtitles.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(downloadsSaveSubtitles),
          options: yesNoOptions,
          IconComponent: Subtitles,
          onSettingPress,
        },
        {
          id: 'downloadsSavePoster',
          title: t('Download poster'),
          subtitle: t('Toggle download poster.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(downloadsSavePoster),
          options: yesNoOptions,
          IconComponent: BookImage,
          onSettingPress,
        },
      ],
    },
    {
      id: 'player-group',
      type: SETTING_TYPE.GROUP,
      title: t('Player'),
      IconComponent: TvMinimalPlay,
      settings: [
        {
          id: 'playerQuality',
          title: t('Player video quality'),
          type: SETTING_TYPE.SELECT,
          value: getPlayerQuality(),
          options: [
            MAX_QUALITY,
            {
              label: '4K',
              value: '4K',
            },
            {
              label: '2K',
              value: '2K',
            },
            {
              label: '1080p Ultra',
              value: '1080p Ultra',
            },
            {
              label: '1080p',
              value: '1080p',
            },
            {
              label: '720p',
              value: '720p',
            },
            {
              label: '480p',
              value: '480p',
            },
            {
              label: '360p',
              value: '360p',
            },
          ],
          onSettingPress: (value) => {
            updatePlayerQuality(value as string);
          },
          IconComponent: Settings2,
        },
        {
          id: 'playerSaveQuality',
          title: t('Save player video quality'),
          subtitle: t('Toggle save quality.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(playerSaveQuality),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: Pin,
        },
        {
          id: 'playerAskQuality',
          title: t('Ask quality'),
          subtitle: t('Toggle ask quality.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(playerAskQuality),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: CircleQuestionMark,
        },
        {
          id: 'playerRewindSeconds',
          title: t('Player rewind seconds'),
          type: SETTING_TYPE.SELECT,
          value: playerRewindSeconds.toString(),
          options: Array.from({ length: 12 }, (_, index) => {
            const value = (index + 1) * 5;

            return {
              value: value.toString(),
              label: t('{{seconds}} seconds', { seconds: value }),
            };
          }),
          IconComponent: Rewind,
          onSettingPress,
        },
        {
          id: 'playerDefaultAspectRatio',
          title: t('Player default aspect ratio'),
          type: SETTING_TYPE.SELECT,
          value: playerDefaultAspectRatio,
          options: ASPECT_RATIO_OPTIONS.map((option) => ({
            value: option,
            label: getAspectRatioLabel(option),
          })),
          IconComponent: Maximize2,
          onSettingPress,
        },
        {
          id: 'playerAutoNextEpisode',
          title: t('Auto next episode'),
          subtitle: t('Toggle auto next episode.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(playerAutoNextEpisode),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: StepForward,
        },
        {
          id: 'playerLongPressSpeed',
          title: t('Player long press speed'),
          type: SETTING_TYPE.SELECT,
          value: playerLongPressSpeed.toString(),
          options: Array.from({ length: 12 }, (_, index) => {
            const value = (index + 1) * 0.25;

            return {
              value: value.toString(),
              label: `${value.toString()}x`,
            };
          }),
          onSettingPress,
          IconComponent: CircleGauge,
          isHidden: isTV,
        },
        {
          id: 'playerDefaultSpeed',
          title: t('Player default speed'),
          type: SETTING_TYPE.SELECT,
          value: playerDefaultSpeed.toString(),
          options: DEFAULT_SPEEDS.map((value) => {
            return {
              value: value.toString(),
              label: `${value.toString()}x`,
            };
          }),
          onSettingPress,
          IconComponent: Gauge,
        },
        {
          id: 'playerShowBufferTime',
          title: t('Show buffer time'),
          subtitle: t('Toggle buffer time display.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(playerShowBufferTime),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: LoaderCircle,
        },
        {
          id: 'playerShowEndTime',
          title: t('Show end time'),
          subtitle: t('Toggle end time display.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(playerShowEndTime),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: MoveRight,
        },
        {
          id: 'playerStopPlayOnButtonTV',
          title: t('Stop play on button TV'),
          subtitle: t('Toggle stop play on button TV.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(playerStopPlayOnButtonTV),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: CircleArrowRight,
          isHidden: !isTV,
        },
        {
          id: 'playerBufferTimeSetting',
          title: t('Player buffer time settings'),
          type: SETTING_TYPE.SELECT,
          value: playerBufferTimeSetting ? playerBufferTimeSetting.toString() : 'auto',
          options: [{
            value: 'auto',
            label: t('Auto'),
          }, ...Array.from({ length: 12 }, (_, index) => {
            const value = (index + 1) * 15;

            return {
              value: value.toString(),
              label: t('{{seconds}} seconds', { seconds: value }),
            };
          })],
          onSettingPress: (value, key) => {
            const newValue = value === 'auto' ? undefined : convertStringToNumber(value);

            setConfig(key, newValue);
          },
          IconComponent: Loader,
        },
      ],
    },
    {
      id: 'about-group',
      type: SETTING_TYPE.GROUP,
      title: t('About'),
      IconComponent: Info,
      settings: [
        {
          id: 'telegram',
          title: 'Telegram',
          subtitle: t('Go to Telegram'),
          type: SETTING_TYPE.LINK,
          value: 'link',
          onSettingPress: () => openLinkInBrowser(TELEGRAM_LINK),
          imageLink: require('../../../assets/images/telegram-qr.png'),
          IconComponent: TelegramIcon,
          iconProps: {
            color: undefined,
            strokeWidth: 1,
            fill: theme.colors.icon,
            absoluteStrokeWidth: true,
          },
          iconPropsFocused: {
            fill: theme.colors.iconFocused,
          },
        },
        {
          id: 'github',
          title: 'Github',
          subtitle: t('Go to GitHub'),
          type: SETTING_TYPE.LINK,
          value: 'link',
          imageLink: require('../../../assets/images/github-qr.png'),
          onSettingPress: () => openLinkInBrowser(GITHUB_LINK),
          IconComponent: GithubIcon,
        },
        {
          id: 'version',
          title: t('App version'),
          subtitle: Application.nativeApplicationVersion ?? '0.0.0',
          type: SETTING_TYPE.TEXT,
          disableUpdate: true,
          onSettingPress: (_, __, update) => {
            const result = handleTap();

            if (result) {
              setConfig('securedSettings', true);

              update((prevSettings) => prevSettings.map((st) => {
                if (st.id === 'isFirestore') {
                  return {
                    ...st,
                    isHidden: false,
                  };
                }

                return st;
              }));
            }
          },
          IconComponent: Info,
        },
        {
          id: 'checkForUpdates',
          title: t('Check for updates'),
          subtitle: t('Toggle check for updates.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(checkForUpdates),
          options: yesNoOptions,
          onSettingPress,
          IconComponent: RefreshCw,
        },
        {
          id: 'isFirestore',
          title: t('Time share'),
          subtitle: t('Toggle time share. It will consume more data.'),
          type: SETTING_TYPE.SWITCH,
          value: convertBooleanToString(isFirestore),
          options: yesNoOptions,
          onSettingPress,
          isHidden: !securedSettings,
          IconComponent: Cloud,
        },
      ],
    },
  ]);

  const onSettingUpdate = async (setting: SettingItem, value: string) => {
    const { id, onSettingPress: onPress, disableUpdate, value: prevValue = '' } = setting;

    if (!onPress) {
      return true;
    }

    if (!disableUpdate) {
      setSettings((prevSettings) => updateSettings(prevSettings, value, id));
    }

    const result = await onPress?.(value, id, setSettings);

    if (result === false) {
      await onPress?.(prevValue, id, setSettings);

      if (!disableUpdate) {
        setSettings((prevSettings) => updateSettings(prevSettings, prevValue ?? '', id));
      }

      return false;
    }

    return true;
  };

  const prepareSettings = () => {
    return updateSettings(settings);
  };

  const containerProps = {
    settings: prepareSettings(),
    onSettingUpdate,
  };

  return isTV ? <SettingsScreenComponentTV { ...containerProps } /> : <SettingsScreenComponent { ...containerProps } />;
}

export default SettingsScreenContainer;
