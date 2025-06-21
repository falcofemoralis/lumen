import { ApiInterface, ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { ACCOUNT_ROUTE, NOTIFICATIONS_ROUTE } from 'Component/NavigationBar/NavigationBar.config';
import { BadgeData } from 'Component/NavigationBar/NavigationBar.type';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { CookiesManager } from 'Util/Cookies';
import { safeJsonParse } from 'Util/Json';
import { requestValidator } from 'Util/Request';
import { miscStorage } from 'Util/Storage';

export const CREDENTIALS_STORAGE = 'CREDENTIALS_STORAGE';
export const PROFILE_STORAGE = 'PROFILE_STORAGE';
export const NOTIFICATIONS_STORAGE = 'NOTIFICATIONS_STORAGE';

interface ServiceContextInterface {
  isSignedIn: boolean;
  notifications: NotificationInterface[] | null;
  badgeData: BadgeData;
  profile: ProfileInterface | null;
  updateCurrentService: (service: ApiServiceType) => void;
  getCurrentService: () => ApiInterface;
  setAuthorization: (auth: string, name: string, password: string) => void;
  login: (name: string, password: string) => Promise<void>;
  logout: () => void;
  getNotifications: () => Promise<void>;
  resetNotifications: () => Promise<void>;
  updateProvider: (value: string, skipValidation?: boolean) => Promise<void>;
  updateCDN: (value: string, skipValidation?: boolean) => Promise<void>;
  updateUserAgent: (value: string) => void;
  validateUrl: (url: string) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextInterface>({
  isSignedIn: false,
  notifications: null,
  badgeData: {},
  profile: null,
  updateCurrentService: () => {},
  getCurrentService: () => services[ApiServiceType.REZKA],
  setAuthorization: () => {},
  login: async () => {},
  logout: () => {},
  getNotifications: async () => {},
  resetNotifications: async () => {},
  updateProvider: async () => {},
  updateCDN: async () => {},
  updateUserAgent: () => {},
  validateUrl: async () => {},
});

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentService, setCurrentService] = useState<ApiServiceType>(ApiServiceType.REZKA);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!miscStorage.getString(CREDENTIALS_STORAGE));
  const [notifications, setNotifications] = useState<NotificationInterface[] | null>(null);
  const [badgeData, setBadgeData] = useState<BadgeData>({});
  const [profile, setProfile] = useState<ProfileInterface | null>(
    safeJsonParse<ProfileInterface>(miscStorage.getString(PROFILE_STORAGE))
  );

  /**
   * Update the current service
   * @param {ApiServiceType} service - The service to set as current
   */
  const updateCurrentService = useCallback((service: ApiServiceType) => {
    setCurrentService(service);
  }, []);

  /**
   * Get the current service
   * @returns {ApiInterface} - The current service
   */
  const getCurrentService = useCallback(() => {
    return services[currentService];
  }, [currentService]);

  /**
   * Set the authorization for the current service
   * @param {string} auth - The authorization token
   * @param {string} name - The username
   * @param {string} password - The password
   */
  const setAuthorization = useCallback((auth: string, name: string, password: string) => {
    const service = getCurrentService();
    service.setAuthorization(auth);
    miscStorage.set(CREDENTIALS_STORAGE, JSON.stringify({ name, password }));
  }, [getCurrentService]);

  /**
   * Load the profile for the current service
   */
  const loadProfile = useCallback(async () => {
    const value = await getCurrentService().getProfile();

    miscStorage.set(PROFILE_STORAGE, JSON.stringify(value));
    setProfile(value);
  }, []);

  /**
   * Remove the profile for the current service
   */
  const removeProfile = useCallback(() => {
    miscStorage.delete(PROFILE_STORAGE);
    setProfile(null);
  }, []);

  /**
   * Login to the current service
   * @param {string} name - The username
   * @param {string} password - The password
   */
  const login = useCallback(async (name: string, password: string) => {
    const auth = await getCurrentService().login(name, password);
    setAuthorization(auth, name, password);

    await loadProfile();

    setIsSignedIn(true);
  }, [getCurrentService, setAuthorization, loadProfile]);

  /**
   * Logout from the current service
   */
  const logout = useCallback(() => {
    const service = getCurrentService();
    service.logout();
    service.setAuthorization('');
    setIsSignedIn(false);
    removeProfile();
    miscStorage.set(CREDENTIALS_STORAGE, '');
  }, [getCurrentService, removeProfile]);

  /**
   * Load notifications for the current service
   */
  const getNotifications = useCallback(async () => {
    try {
      const data = await getCurrentService().getNotifications();

      setNotifications(data);

      const newItems = data.reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      },
      []);

      const previousItems = safeJsonParse<NotificationItemInterface[]>(
        miscStorage.getString(NOTIFICATIONS_STORAGE)
      ) ?? [];

      const badgeCount = newItems.reduce((acc, item) => {
        if (!previousItems.find((prevItem) => prevItem.link === item.link)) {
          acc += 1;
        }

        return acc;
      },
      0);

      setBadgeData({
        [ConfigStore.isTV() ? NOTIFICATIONS_ROUTE : ACCOUNT_ROUTE]: badgeCount,
      });
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  }, [getCurrentService]);

  /**
   * Reset notifications for the current service
   */
  const resetNotifications = useCallback(async () => {
    if (notifications) {
      const newItems = notifications.reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      },
      []);

      miscStorage.set(NOTIFICATIONS_STORAGE, JSON.stringify(newItems));
    }

    setBadgeData({
      [ConfigStore.isTV() ? NOTIFICATIONS_ROUTE : ACCOUNT_ROUTE]: 0,
    });
  }, [notifications]);

  /**
   * Validate the URL for the current service
   * @param {string} url - The URL to validate
   */
  const validateUrl = useCallback(async (url: string) => {
    await requestValidator(url, getCurrentService().getHeaders());
  }, [getCurrentService]);

  /**
   * Update the provider for the current service
   * @param {string} value - The provider URL
   * @param {boolean} skipValidation - Whether to skip validation
   */
  const updateProvider = useCallback(async (value: string, skipValidation = false) => {
    if (!skipValidation) {
      await validateUrl(value);
    }

    getCurrentService().setProvider(value);

    // Reset cookies
    (new CookiesManager()).reset();

    if (isSignedIn) {
      const { name, password } = safeJsonParse<{ name: string; password: string }>(
        miscStorage.getString(CREDENTIALS_STORAGE)
      ) ?? {};

      logout();

      if (name && password) {
        await login(name, password);
      }
    }
  }, [getCurrentService, validateUrl, isSignedIn, logout, login]);

  /**
   * Update the CDN for the current service
   * @param {string} value - The CDN URL
   * @param {boolean} skipValidation - Whether to skip validation
   */
  const updateCDN = useCallback(async (value: string, skipValidation = false) => {
    if (value !== 'auto' && !skipValidation) {
      await validateUrl(value);
    }

    getCurrentService().setCDN(value);
  }, [getCurrentService, validateUrl]);

  /**
   * Update the user agent for the current service
   * @param {string} value - The user agent string
   */
  const updateUserAgent = useCallback((value: string) => {
    getCurrentService().setUserAgent(value);
  }, [getCurrentService]);

  const value = useMemo(() => ({
    isSignedIn,
    notifications,
    badgeData,
    profile,
    updateCurrentService,
    getCurrentService,
    setAuthorization,
    removeProfile,
    login,
    logout,
    getNotifications,
    resetNotifications,
    updateProvider,
    updateCDN,
    updateUserAgent,
    validateUrl,
  }), [
    isSignedIn,
    notifications,
    badgeData,
    profile,
    updateCurrentService,
    getCurrentService,
    setAuthorization,
    removeProfile,
    login,
    logout,
    getNotifications,
    resetNotifications,
    updateProvider,
    updateCDN,
    updateUserAgent,
    validateUrl,
  ]);

  return (
    <ServiceContext.Provider value={ value }>
      { children }
    </ServiceContext.Provider>
  );
};

export const useServiceContext = () => use(ServiceContext);
