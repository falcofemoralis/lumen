import { ApiInterface, ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
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
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { UserDataInterface } from 'Type/UserData.interface';
import { CookiesManager } from 'Util/Cookies';
import { requestValidator } from 'Util/Request';
import { storage } from 'Util/Storage';

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
  logout: () => void;
  updateProvider: (value: string, skipValidation?: boolean) => Promise<void>;
  updateCDN: (value: string, skipValidation?: boolean) => Promise<void>;
  updateUserAgent: (value: string) => void;
  updateOfficialMode: (value: string) => void;
  validateUrl: (url: string) => Promise<void>;
  getCDNs: () => DropdownItem[];
  viewProfile: () => void;
  resetNotifications: () => Promise<void>;
  fetchUserData: () => Promise<UserDataInterface | null>;
  getNotifications: () => Promise<NotificationInterface[]>;
  viewPayments: () => void;
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
  getCDNs: () => [],
  viewProfile: () => {},
  resetNotifications: async () => {},
  fetchUserData: async () => null,
  getNotifications: async () => [],
  viewPayments: () => {},
});

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentService, setCurrentService] = useState<ApiInterface>(services[DEFAULT_SERVICE]);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!storage.getMiscStorage().loadString(CREDENTIALS_STORAGE));
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
  const logout = useCallback(() => {
    currentService.logout();
    currentService.setAuthorization('');
    setIsSignedIn(false);
    removeProfile();
    storage.getMiscStorage().remove(CREDENTIALS_STORAGE);
    storage.getMiscStorage().remove(NOTIFICATIONS_STORAGE);
    storage.getMiscStorage().remove(USER_DATA_STORAGE_CACHE);
    (new CookiesManager()).reset();
  }, [currentService, removeProfile]);

  /**
   * Validate the URL for the current service
   * @param {string} url - The URL to validate
   */
  const validateUrl = useCallback(async (url: string, headers?: HeadersInit) => {
    await requestValidator(url, headers ?? currentService.getHeaders());
  }, [currentService]);

  const reLogin = useCallback(async () => {
    // Reset cookies
    (new CookiesManager()).reset();

    if (isSignedIn) {
      const data = storage.getMiscStorage().load<{ name: string; password: string }>(CREDENTIALS_STORAGE);

      logout();

      if (data && data.name && data.password) {
        await login(data.name, data.password);
      }
    }
  }, [isSignedIn, logout, login]);

  /**
   * Update the provider for the current service
   * @param {string} value - The provider URL
   * @param {boolean} skipValidation - Whether to skip validation
   */
  const updateProvider = useCallback(async (value: string, skipValidation = false) => {
    if (!skipValidation) {
      const url = value;

      await validateUrl(url);
    }

    if (value !== '') {
      currentService.setProvider(value);
    }

    reLogin();
  }, [currentService, validateUrl, reLogin]);

  /**
   * Update the CDN for the current service
   * @param {string} value - The CDN URL
   * @param {boolean} skipValidation - Whether to skip validation
   */
  const updateCDN = useCallback(async (value: string, skipValidation = false) => {
    if (value !== 'auto' && !skipValidation) {
      await validateUrl(value);
    }

    currentService.setCDN(value);
  }, [currentService, validateUrl]);

  /**
   * Update the user agent for the current service
   * @param {string} value - The user agent string
   */
  const updateUserAgent = useCallback((value: string) => {
    currentService.setUserAgent(value);
  }, [currentService]);

  /**
   * Update the official mode for the current service
   * @param {string} value - The official mode string
   */
  const updateOfficialMode = useCallback((value: string) => {
    currentService.setOfficialMode(value);

    reLogin();
  }, [currentService, reLogin]);

  /**
   * Get the CDNs for the current service
   */
  const getCDNs = useCallback(() => {
    return [
      {
        value: 'auto',
        label: t('Automatic'),
      },
    ].concat(currentService.defaultCDNs.map((cdn) => ({
      value: cdn,
      label: cdn,
    }))) ;
  }, [currentService]);

  const viewProfile = useCallback(() => {
    Linking.openURL(`${currentService.getProvider()}/user/${profile?.id}/`);
  }, [currentService, profile]);

  const viewPayments = useCallback(() => {
    Linking.openURL(`${currentService.getProvider()}/payments/`);
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
    getCDNs,
    viewProfile,
    resetNotifications,
    fetchUserData,
    getNotifications,
    viewPayments,
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
    getCDNs,
    viewProfile,
    resetNotifications,
    fetchUserData,
    getNotifications,
    viewPayments,
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