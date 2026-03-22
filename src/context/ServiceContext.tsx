import { ApiInterface, ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { t } from 'i18n/translate';
import { ACCOUNT_SCREEN, ACCOUNT_TAB, NOTIFICATIONS_SCREEN, NOTIFICATIONS_TAB } from 'Navigation/navigationRoutes';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Linking } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { BadgeData } from 'Type/BadgeData.interface';
import { FilmInterface } from 'Type/Film.interface';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { UserDataInterface } from 'Type/UserData.interface';
import { openLinkInBrowser } from 'Util/Link';
import { formatURI, requestValidator } from 'Util/Request';
import { storage } from 'Util/Storage';
import { updateUrlHost } from 'Util/Url';

import { getGlobalConfig } from './ConfigContext';

export const CREDENTIALS_STORAGE = 'CREDENTIALS_STORAGE';
export const PROFILE_STORAGE = 'PROFILE_STORAGE';
export const NOTIFICATIONS_STORAGE = 'NOTIFICATIONS_STORAGE';
export const USER_DATA_STORAGE_CACHE = 'USER_DATA_STORAGE_CACHE';
export const USER_DATA_STORAGE_CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const DEFAULT_SERVICE = ApiServiceType.REZKA;

export interface ServiceContextInterface {
  isSignedIn: boolean;
  profile: ProfileInterface | null;
  currentService: ApiInterface;
  badgeData: BadgeData;
  updateCurrentService: (service: ApiServiceType) => void;
  setAuthorization: (auth: string, name: string, password: string) => void;
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
  updateCurrentService: () => {},
  setAuthorization: () => {},
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

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentService, setCurrentService] = useState<ApiInterface>(services[DEFAULT_SERVICE]);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(currentService.isSignedIn());
  const [profile, setProfile] = useState<ProfileInterface | null>(() => {
    const value = storage.getMiscStorage().load<ProfileInterface>(PROFILE_STORAGE);

    if (!value) return null;

    return {
      ...value,
      avatar: currentService.getPhotoUrl(value.avatar),
    };
  });
  const [badgeData, setBadgeData] = useState<BadgeData>({});

  /**
   * Update the current service
   * @param {ApiServiceType} service - The service to set as current
   */
  const updateCurrentService = useCallback((service: ApiServiceType) => {
    setCurrentService(services[service]);
  }, []);

  /**
   * Set the authorization for the current service
   * @param {string} auth - The authorization token
   * @param {string} name - The username
   * @param {string} password - The password
   */
  const setAuthorization = useCallback((auth: string, name: string, password: string) => {
    currentService.setAuthorization(auth);
    storage.getMiscStorage().save(CREDENTIALS_STORAGE, { name, password });
  }, [currentService]);

  /**
   * Load the profile for the current service
   */
  const loadProfile = useCallback(async () => {
    const value = await currentService.getProfile();

    storage.getMiscStorage().save(PROFILE_STORAGE, value);
    setProfile({
      ...value,
      avatar: currentService.getPhotoUrl(value.avatar),
    });
  }, [currentService]);

  /**
   * Update the profile for the current service
   */
  const updateProfile = useCallback(async (p: Partial<ProfileInterface>) => {
    const value = storage.getMiscStorage().load<ProfileInterface>(PROFILE_STORAGE);

    if (!value) return;

    storage.getMiscStorage().save(PROFILE_STORAGE, {
      ...value,
      ...p,
    });
  }, []);

  /**
   * Remove the profile for the current service
   */
  const removeProfile = useCallback(() => {
    storage.getMiscStorage().remove(PROFILE_STORAGE);
    setProfile(null);
  }, []);

  /**
   * Login to the current service
   * @param {string} name - The username
   * @param {string} password - The password
   */
  const login = useCallback(async (name: string, password: string) => {
    const auth = await currentService.login(name, password);
    setAuthorization(auth, name, password);

    await loadProfile();

    setIsSignedIn(true);
  }, [currentService, setAuthorization, loadProfile]);

  /**
   * Logout from the current service
   */
  const logout = useCallback((forceLogout: boolean = false) => {
    currentService.logout();
    currentService.setAuthorization('');

    if (forceLogout) {
      setIsSignedIn(false);
    }

    removeProfile();
    storage.getMiscStorage().remove(CREDENTIALS_STORAGE);
    storage.getMiscStorage().remove(NOTIFICATIONS_STORAGE);
    storage.getMiscStorage().remove(USER_DATA_STORAGE_CACHE);
  }, [currentService, removeProfile]);

  /**
   * Validate the URL for the current service
   * @param {string} url - The URL to validate
   */
  const validateUrl = useCallback(async (url: string, headers?: HeadersInit) => {
    await requestValidator(url, headers ?? currentService.getHeaders());
  }, [currentService]);

  /**
   * Re-login to the current service using the stored credentials. This is useful when the provider is changed, so we can re-login to get the new profile and other data.
   */
  const reLogin = useCallback(async () => {
    const data = storage.getMiscStorage().load<{ name: string; password: string }>(CREDENTIALS_STORAGE);

    currentService.logout();
    currentService.setAuthorization('');

    if (data && data.name && data.password) {
      await login(data.name, data.password);
    }
  }, [currentService, login]);

  /**
   * Update the provider for the current service
   * @param {string} value - The provider URL
   */
  const updateProvider = useCallback(async (value: string) => {
    const cleanedValue = value.replace(/\/+$/, '');
    currentService.setProvider(cleanedValue);
  }, [currentService]);

  /**
   * Update the CDN for the current service
   * @param {string} value - The CDN URL
   */
  const updateCDN = useCallback(async (value: string) => {
    const cleanedValue = value.replace(/\/+$/, '');
    currentService.setCDN(cleanedValue);
  }, [currentService]);

  /**
   * Update the user agent for the current service
   * @param {string} value - The user agent string
   */
  const updateUserAgent = useCallback((value: string) => {
    currentService.setUserAgent(value);
  }, [currentService]);

  /**
   * Update the official mode for the current service
   * @param {boolean} isActive - Whether the official mode is active
   */
  const updateOfficialMode = useCallback((isActive: boolean) => {
    currentService.setOfficialMode(isActive ? '1' : '');
  }, [currentService]);

  /**
   * Update the automatic CDN mode for the current service
   * @param {boolean} isActive - Whether the automatic CDN mode is active
   */
  const updateAutomaticCDN = useCallback((isActive: boolean) => {
    currentService.setAutomaticCDN(isActive);
  }, [currentService]);

  const viewProfile = useCallback(() => {
    let link = `${currentService.getProvider()}/user/${profile?.id}/`;

    if (currentService.isOfficialMode()) {
      link = updateUrlHost(link, currentService.getOfficialShareLink());
    }

    openLinkInBrowser(link);
  }, [currentService, profile]);

  const viewPayments = useCallback(() => {
    let link = `${currentService.getProvider()}/payments/`;

    if (currentService.isOfficialMode()) {
      link = updateUrlHost(link, currentService.getOfficialShareLink());
    }

    openLinkInBrowser(link);
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
   * Reset notifications for the current service
   */
  const resetNotifications = useCallback(async () => {
    const { data: userData } = storage.getMiscStorage().load<
      { data: UserDataInterface }
    >(USER_DATA_STORAGE_CACHE) || { data: null };

    if (userData?.notifications) {
      const { notifications } = userData;

      const newItems = notifications.reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      }, []);

      storage.getMiscStorage().save(NOTIFICATIONS_STORAGE, newItems);
    }

    setBadgeData({
      [getGlobalConfig().isTV ? NOTIFICATIONS_SCREEN : ACCOUNT_SCREEN]: 0,
    });
  }, []);

  /**
   * Fetch the user data for the current service
   */
  const fetchUserData = useCallback(async () => {
    try {
      const cachedData = storage.getMiscStorage().loadString(USER_DATA_STORAGE_CACHE);

      if (cachedData) {
        const { data, ttl } = JSON.parse(cachedData) as { data: UserDataInterface; ttl: number };

        if (Date.now() < ttl) {
          const { notifications, premiumDays } = data;

          updateNotifications(notifications);
          updateProfile({ premiumDays });

          return data;
        }
      }

      const userData = await currentService.getUserData();

      storage.getMiscStorage().save(USER_DATA_STORAGE_CACHE, {
        data: userData,
        ttl: Date.now() + USER_DATA_STORAGE_CACHE_TTL,
      });

      const { notifications, premiumDays } = userData;

      updateNotifications(notifications);
      updateProfile({ premiumDays });

      return userData;
    } catch (error) {
      NotificationStore.displayError(error as Error);

      return null;
    }
  }, [currentService, updateNotifications, updateProfile]);

  const getNotifications = useCallback(async () => {
    const userData = await fetchUserData();

    return userData?.notifications ?? [];
  }, [fetchUserData]);

  const prepareShareBody = useCallback((film: FilmInterface) => {
    const { title, link } = film;

    let shareLink = formatURI(link, {}, currentService.getProvider());;

    if (currentService.isOfficialMode()) {
      shareLink = updateUrlHost(shareLink, currentService.getOfficialShareLink());
    }

    return t('Watch {{title}}:\n {{link}}', { title, link: shareLink });
  }, [currentService]);

  const value = useMemo(() => ({
    isSignedIn,
    profile,
    currentService,
    badgeData,
    updateCurrentService,
    setAuthorization,
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
    updateCurrentService,
    setAuthorization,
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