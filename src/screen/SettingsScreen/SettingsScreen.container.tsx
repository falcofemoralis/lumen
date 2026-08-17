import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import { getCurrentLanguage, Language, setLanguage } from 'i18n/index';
import { t } from 'i18n/translate';
import { reactNativeAfr } from 'Modules/react-native-afr';
import { reactNativeDownloads } from 'Modules/react-native-downloads';
import { reactNativeTvChannels } from 'Modules/react-native-tv-channels';
import { reactNativeTvSearch } from 'Modules/react-native-tv-search';
import { useCallback, useMemo, useState } from 'react';
import { TEST_URL } from 'Screen/WelcomeScreen/WelcomeScreen.config';
import { DeviceConfigType } from 'src/config';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { ThemeContextModeT } from 'Theme/types';
import { restartApp } from 'Util/Device';
import { MAX_PARALLEL_DOWNLOADS_OPTIONS } from 'Util/Download';
import { ensureDefaultLocalCategory } from 'Util/LocalLibrary';
import { setTimeoutSafe } from 'Util/Misc';
import { getPlayerQuality, updatePlayerQuality } from 'Util/Player';
import { requestTvChannelsBrowsable, syncTvChannels } from 'Util/TvChannels';

import SettingsScreenComponent from './SettingsScreen.component';
import SettingsScreenComponentTV from './SettingsScreen.component.atv';

export function SettingsScreenContainer() {
  const { setConfig, isTV, ...config } = useConfigContext();
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
  const [appLanguage, setAppLanguage] = useState(getCurrentLanguage());
  const [playerQuality, setPlayerQuality] = useState(getPlayerQuality());
  const [officialMode, setOfficialMode] = useState(!!currentService.getConfig('officialMode'));
  const [provider, setProvider] = useState(currentService.getConfig('provider'));
  const [officialShareLink, setOfficialShareLink] = useState(currentService.getConfig('officialModeShareLink'));
  const [automaticCDN, setAutomaticCDN] = useState(currentService.getConfig('autoCdn'));
  const [cdn, setCdn] = useState(currentService.getCDN());
  const [userAgent, setUserAgent] = useState(currentService.getConfig('userAgentNew'));

  const providerOptions = useMemo(
    () => currentService.defaultProviders,
    [currentService]
  );

  const cdnOptions = useMemo(
    () => currentService.defaultCDNs,
    [currentService]
  );

  const homeMenuOptions = useMemo(
    () => currentService.getHomeMenu().map(({ id, title }) => ({ value: id, label: title })),
    [currentService]
  );

  const downloadsPathOptions = useMemo(
    () => reactNativeDownloads.getDownloadsDirectories().map((dir) => ({
      value: dir.downloadsPath,
      label: dir.isPrimary
        ? 'Internal storage'
        : (dir.isRemovable ? 'SD Card' : 'External storage'),
    })),
    []
  );

  const downloadsMaxParallelOptions = useMemo(
    () => MAX_PARALLEL_DOWNLOADS_OPTIONS.map((amount) => ({
      value: String(amount),
      label: String(amount),
    })),
    []
  );

  const appVersion = useMemo(
    () => Application.nativeApplicationVersion ?? '0.0.0',
    []
  );

  // TV boxes running Android 7 and below have no TvProvider to publish channels to
  const isTvChannelsSupported = useMemo(() => reactNativeTvChannels.isSupported(), []);

  // only a TV has a global search box that asks apps for suggestions
  const isTvSearchSupported = useMemo(() => reactNativeTvSearch.isSupported(), []);

  // a phone panel has a fixed refresh rate there is no point matching a video to, and
  // below Android 6 there is no display mode API to ask
  const isAutoFrameRateSupported = useMemo(() => reactNativeAfr.isSupported(), []);

  const onConfigUpdate = (key: keyof DeviceConfigType, value: unknown) => {
    setConfig(key, value);
  };

  const onLanguageChange = useCallback(async (value: string) => {
    setAppLanguage(value as Language);

    await setLanguage(value as Language);

    NotificationStore.displayMessage(t('Restart app to apply changes.'));

    setTimeoutSafe(() => {
      restartApp();
    }, 2000);
  }, []);

  const onThemeSchemeChange = useCallback((value: string) => {
    setTimeoutSafe(() => {
      setThemeContextOverride(value === 'system' ? undefined : (value as ThemeContextModeT));
    }, 50);
  }, [setThemeContextOverride]);

  const onLocalLibraryChange = useCallback((value: boolean) => {
    setConfig('isLocalLibrary', value);

    if (value) {
      ensureDefaultLocalCategory(t('Favorites'));
    }
  }, [setConfig]);

  const onOfficialModeChange = useCallback(async (value: boolean) => {
    setOfficialMode(value);

    try {
      updateOfficialMode(value);

      await reLogin();
    } catch (error) {
      if (value) {
        NotificationStore.displayError(error as Error);
      } else {
        NotificationStore.displayError(
          t('Provider is not available. Update the provider before disabling official mode.')
        );
      }

      setOfficialMode(!value);
      updateOfficialMode(!value);

      // relogin back
      await reLogin();

      return false;
    }

    return true;
  }, [reLogin, updateOfficialMode]);

  const onProviderChange = useCallback(async (value: string) => {
    const prevProvider = provider;
    const prevOfficialMode = officialMode;

    setProvider(value);
    updateOfficialMode(false);

    try {
      await validateUrl(value);

      updateProvider(value);

      if (!prevOfficialMode) {
        await reLogin();
      }
    } catch (error) {
      NotificationStore.displayError(error as Error);

      setProvider(prevProvider);
      updateProvider(prevProvider);
      updateOfficialMode(prevOfficialMode);

      return false;
    } finally {
      updateOfficialMode(prevOfficialMode);
    }

    return true;
  }, [officialMode, provider, reLogin, updateOfficialMode, updateProvider, validateUrl]);

  const onOfficialShareLinkChange = useCallback((value: string) => {
    setOfficialShareLink(value);
    currentService.setConfig('officialModeShareLink', value);
  }, [currentService]);

  const onAutomaticCDNChange = useCallback((value: boolean) => {
    setAutomaticCDN(value);
    updateAutomaticCDN(value);
  }, [updateAutomaticCDN]);

  const onCDNChange = useCallback(async (value: string) => {
    const prevCDN = cdn;

    setCdn(value);

    try {
      updateCDN(value);

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

      setCdn(prevCDN);
      updateCDN(prevCDN);

      return false;
    }

    return true;
  }, [cdn, currentService, updateCDN, validateUrl]);

  const onUserAgentChange = useCallback((value: string) => {
    setUserAgent(value);
    updateUserAgent(value);
  }, [updateUserAgent]);

  const onPlayerQualityChange = useCallback((value: string) => {
    setPlayerQuality(value);
    updatePlayerQuality(value);
  }, []);

  /**
   * The channels have to exist before the launcher can be asked to show them, and
   * the periodic sync may not have run yet (it was just switched on, or the last one
   * is still within its interval), so this publishes them first.
   */
  const onTvChannelsAddToHome = useCallback(async () => {
    await syncTvChannels(currentService, { force: true });

    const accepted = await requestTvChannelsBrowsable();

    NotificationStore.displayMessage(
      accepted
        ? t('Added to the home screen')
        : t('No channels were added')
    );
  }, [currentService]);

  const containerProps = {
    ...config,
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
    homeMenuOptions,
    downloadsPathOptions,
    downloadsMaxParallelOptions,
    appVersion,
    isTvChannelsSupported,
    isTvSearchSupported,
    isAutoFrameRateSupported,
    onConfigUpdate,
    onTvChannelsAddToHome,
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
  };

  return isTV
    ? <SettingsScreenComponentTV { ...containerProps } />
    : <SettingsScreenComponent { ...containerProps } />;
}

export default SettingsScreenContainer;
