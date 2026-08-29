import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_SERVICE, services } from 'Api/index';
import { ApiInterface, ApiServiceType } from 'Api/type';
import { t } from 'i18n/translate';
import { ACCOUNT_TAB, NOTIFICATIONS_TAB } from 'Navigation/navigationRoutes';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import NotificationStore from 'Store/Notification.store';
import { BadgeData } from 'Type/BadgeData.interface';
import { FilmInterface } from 'Type/Film.interface';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { UserDataInterface } from 'Type/UserData.interface';
import { openLinkInBrowser } from 'Util/Link';
import { getLocalSeriesUpdates } from 'Util/LocalLibrary';
import { queryKeys, STALE_TIME } from 'Util/Query';
import { storage } from 'Util/Storage';

import { getGlobalConfig } from './ConfigContext';

export const CREDENTIALS_STORAGE = 'CREDENTIALS_STORAGE';
export const NOTIFICATIONS_STORAGE = 'NOTIFICATIONS_STORAGE';
export const USER_DATA_STORAGE_CACHE = 'USER_DATA_STORAGE_CACHE';
export const USER_DATA_STORAGE_CACHE_TTL = 1000 * 60 * 60; // 1 hour

export interface ServiceContextInterface {
  isSignedIn: boolean;
  profile: ProfileInterface | null;
  currentService: ApiInterface;
  badgeData: BadgeData;
  changeCurrentService: (service: ApiServiceType) => void;
  removeProfile: () => void;
  login: (name: string, password: string) => Promise<void>;
  logout: (forceLogout?: boolean) => void;
  updateProvider: (value: string) => Promise<void>;
  updateCDN: (value: string) => Promise<void>;
  updateUserAgent: (value: string) => void;
  updateOfficialMode: (isActive: boolean) => void;
  validateUrl: (url: string) => Promise<void>;
  viewProfile: () => void;
  resetNotifications: () => Promise<void>;
  fetchUserData: () => Promise<UserDataInterface | null>;
  getNotifications: () => Promise<NotificationInterface[]>;
  viewPayments: () => void;
  reLogin: () => Promise<void>;
  updateAutomaticCDN: (isActive: boolean) => void;
  prepareShareBody: (film: FilmInterface) => string;
}

const ServiceContext = createContext<ServiceContextInterface>({
  isSignedIn: false,
  profile: null,
  currentService: services[DEFAULT_SERVICE],
  badgeData: {},
  changeCurrentService: () => {},
  removeProfile: () => {},
  login: async () => {},
  logout: () => {},
  updateProvider: async () => {},
  updateCDN: async () => {},
  updateUserAgent: () => {},
  updateOfficialMode: () => {},
  validateUrl: async () => {},
  viewProfile: () => {},
  resetNotifications: async () => {},
  fetchUserData: async () => null,
  getNotifications: async () => [],
  viewPayments: () => {},
  reLogin: async () => {},
  updateAutomaticCDN: () => {},
  prepareShareBody: () => '',
});

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const [selectedServiceId, setSelectedServiceId] = useState<ApiServiceType>(DEFAULT_SERVICE);
  const [currentService, setSelectedService] = useState<ApiInterface>(services[selectedServiceId]);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(currentService.isSignedIn());
  const [badgeData, setBadgeData] = useState<BadgeData>({});

  const profileKey = useMemo(() => queryKeys.profile(selectedServiceId), [selectedServiceId]);

  const { data: profile = null } = useQuery<ProfileInterface | null>({
    queryKey: profileKey,
    queryFn: () => currentService.getProfile(),
    enabled: isSignedIn,
    staleTime: STALE_TIME.LONG,
  });

  const changeCurrentService = useCallback((service: ApiServiceType) => {
    const newService = services[service];

    setSelectedServiceId(service);
    setSelectedService(newService);
    setIsSignedIn(newService.isSignedIn());
  }, []);

  /**
   * Update the cached profile for the current service
   */
  const updateProfile = useCallback((p: Partial<ProfileInterface>) => {
    queryClient.setQueryData<ProfileInterface | null>(
      profileKey,
      (value) => (value ? { ...value, ...p } : value)
    );
  }, [queryClient, profileKey]);

  /**
   * Remove the profile for the current service
   */
  const removeProfile = useCallback(() => {
    queryClient.setQueryData<ProfileInterface | null>(profileKey, null);
  }, [queryClient, profileKey]);

  /**
   * Login to the current service
   * @param {string} name - The username
   * @param {string} password - The password
   */
  const login = useCallback(async (name: string, password: string) => {
    await currentService.login(name, password);

    // keep original credentials for relogin purpose
    storage.getMiscStorage().save(CREDENTIALS_STORAGE, { name, password });

    setIsSignedIn(true);

    // the service dropped the previous session's profile, so this refetches it
    await queryClient.invalidateQueries({ queryKey: profileKey });
  }, [currentService, queryClient, profileKey]);

  /**
   * Logout from the current service
   */
  const logout = useCallback(() => {
    currentService.logout();

    setIsSignedIn(false);
    removeProfile();

    storage.getMiscStorage().remove(CREDENTIALS_STORAGE);
    storage.getMiscStorage().remove(NOTIFICATIONS_STORAGE);
    storage.getMiscStorage().remove(USER_DATA_STORAGE_CACHE);
  }, [currentService, removeProfile]);

  /**
   * Re-login to the current service using the stored credentials. This is useful when the provider is changed, so we can re-login to get the new profile and other data.
   */
  const reLogin = useCallback(async () => {
    const data = storage.getMiscStorage().load<{ name: string; password: string }>(CREDENTIALS_STORAGE);

    currentService.logout();

    if (data && data.name && data.password) {
      await login(data.name, data.password);
    }
  }, [currentService, login]);

  /**
   * Validate the URL for the current service
   * @param {string} url - The URL to validate
   */
  const validateUrl = useCallback(async (url: string) => {
    await currentService.validateUrl(url);
  }, [currentService]);

  /**
   * Update the provider for the current service
   * @param {string} value - The provider URL
   */
  const updateProvider = useCallback(async (value: string) => {
    const cleanedValue = value.replace(/\/+$/, '');
    currentService.setConfig('provider', cleanedValue);
  }, [currentService]);

  /**
   * Update the CDN for the current service
   * @param {string} value - The CDN URL
   */
  const updateCDN = useCallback(async (value: string) => {
    const cleanedValue = value.replace(/\/+$/, '');
    currentService.setConfig('cdn', cleanedValue);
  }, [currentService]);

  /**
   * Update the user agent for the current service
   * @param {string} value - The user agent string
   */
  const updateUserAgent = useCallback((value: string) => {
    currentService.setConfig('userAgentNew', value);
  }, [currentService]);

  /**
   * Update the official mode for the current service
   * @param {boolean} isActive - Whether the official mode is active
   */
  const updateOfficialMode = useCallback((isActive: boolean) => {
    currentService.setConfig('officialMode', isActive ? '1' : '');
  }, [currentService]);

  /**
   * Update the automatic CDN mode for the current service
   * @param {boolean} isActive - Whether the automatic CDN mode is active
   */
  const updateAutomaticCDN = useCallback((isActive: boolean) => {
    currentService.setConfig('autoCdn', isActive);
  }, [currentService]);

  /**
   * Open profile in the browser
   */
  const viewProfile = useCallback(() => {
    if (!profile) {
      NotificationStore.displayError('Profile is missing!');

      return;
    }

    openLinkInBrowser(currentService.getProfileLink(profile));
  }, [currentService, profile]);

  /**
   * Open payments in the browser
   */
  const viewPayments = useCallback(() => {
    openLinkInBrowser(currentService.getPaymentsLink());
  }, [currentService]);

  /**
   * Update the badge data for the current service
   */
  const updateNotifications = useCallback((data: NotificationInterface[]) => {
    const newItems = data.reduce((acc: NotificationItemInterface[], item) => {
      acc.push(...item.items);

      return acc;
    }, []);

    const previousItems = storage.getMiscStorage().load<NotificationItemInterface[]>(NOTIFICATIONS_STORAGE) ?? [];

    const badgeCount = newItems.reduce((acc, item) => {
      if (!previousItems.find((prevItem) => prevItem.link === item.link)) {
        acc += 1;
      }

      return acc;
    }, 0);

    setBadgeData({
      [getGlobalConfig().isTV ? NOTIFICATIONS_TAB : ACCOUNT_TAB]: badgeCount,
    });
  }, []);

  /**
   * The notifications relevant for the current mode: the account's tracked series,
   * or the day's updates matched against the local library while local mode is on.
   */
  const selectNotifications = useCallback((userData: UserDataInterface): NotificationInterface[] => (
    getGlobalConfig().isLocalLibrary
      ? getLocalSeriesUpdates(userData.updates ?? [])
      : userData.notifications ?? []
  ), []);

  /**
   * Reset notifications for the current service
   */
  const resetNotifications = useCallback(async () => {
    const { data: userData } = storage.getMiscStorage().load<
      { data: UserDataInterface }
    >(USER_DATA_STORAGE_CACHE) || { data: null };

    if (userData) {
      const newItems = selectNotifications(userData).reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      }, []);

      storage.getMiscStorage().save(NOTIFICATIONS_STORAGE, newItems);
    }

    // must match the key updateNotifications writes, which is what the tab bar reads
    setBadgeData({
      [getGlobalConfig().isTV ? NOTIFICATIONS_TAB : ACCOUNT_TAB]: 0,
    });
  }, [selectNotifications]);

  /**
   * Fetch the user data for the current service
   */
  const fetchUserData = useCallback(async () => {
    try {
      const cachedData = storage.getMiscStorage().loadString(USER_DATA_STORAGE_CACHE);

      if (cachedData) {
        const { data, ttl } = JSON.parse(cachedData) as { data: UserDataInterface; ttl: number };

        // a cache written by an older build lacks `updates`; local mode needs them, so refetch
        if (Date.now() < ttl && (!getGlobalConfig().isLocalLibrary || data.updates)) {
          updateNotifications(selectNotifications(data));
          updateProfile({ premiumDays: data.premiumDays });

          return data;
        }
      }

      const userData = await currentService.getUserData();

      storage.getMiscStorage().save(USER_DATA_STORAGE_CACHE, {
        data: userData,
        ttl: Date.now() + USER_DATA_STORAGE_CACHE_TTL,
      });

      const { premiumDays } = userData;

      updateNotifications(selectNotifications(userData));
      updateProfile({ premiumDays });

      return userData;
    } catch (error) {
      NotificationStore.displayError(error as Error);

      return null;
    }
  }, [currentService, updateNotifications, updateProfile, selectNotifications]);

  /**
   * Get fresh notifications
   */
  const getNotifications = useCallback(async () => {
    const userData = await fetchUserData();

    return userData ? selectNotifications(userData) : [];
  }, [fetchUserData, selectNotifications]);

  /**
   * Prepare film share body
   */
  const prepareShareBody = useCallback((film: FilmInterface) => {
    const { title } = film;

    const shareLink = currentService.getShareLink(film);

    return t('Watch {{title}}:\n {{link}}', { title, link: shareLink });
  }, [currentService]);

  const value = useMemo(() => ({
    isSignedIn,
    profile,
    currentService,
    badgeData,
    changeCurrentService,
    removeProfile,
    login,
    logout,
    updateProvider,
    updateCDN,
    updateUserAgent,
    validateUrl,
    updateOfficialMode,
    viewProfile,
    resetNotifications,
    fetchUserData,
    getNotifications,
    viewPayments,
    reLogin,
    updateAutomaticCDN,
    prepareShareBody,
  }), [
    isSignedIn,
    profile,
    currentService,
    badgeData,
    changeCurrentService,
    removeProfile,
    login,
    logout,
    updateProvider,
    updateCDN,
    updateUserAgent,
    validateUrl,
    updateOfficialMode,
    viewProfile,
    resetNotifications,
    fetchUserData,
    getNotifications,
    viewPayments,
    reLogin,
    updateAutomaticCDN,
    prepareShareBody,
  ]);

  return (
    <ServiceContext.Provider value={ value }>
      { children }
    </ServiceContext.Provider>
  );
};

export const useServiceContext = () => {
  const context = useContext(ServiceContext);
  if (!context) throw new Error('useServiceContext must be used within a ServiceProvider');

  return context;
};