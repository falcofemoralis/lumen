import { ApiInterface, ApiServiceType } from 'Api/index';
import { REZKA_PROXY_PROVIDER } from 'Api/RezkaApi/configApi';
import { services } from 'Api/services';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { ProfileInterface } from 'Type/Profile.interface';
import { CookiesManager } from 'Util/Cookies';
import { safeJsonParse } from 'Util/Json';
import { requestValidator, setProxyHeaders } from 'Util/Request';
import { miscStorage } from 'Util/Storage';

export const CREDENTIALS_STORAGE = 'CREDENTIALS_STORAGE';
export const PROFILE_STORAGE = 'PROFILE_STORAGE';

interface ServiceContextInterface {
  isSignedIn: boolean;
  profile: ProfileInterface | null;
  updateCurrentService: (service: ApiServiceType) => void;
  getCurrentService: () => ApiInterface;
  setAuthorization: (auth: string, name: string, password: string) => void;
  login: (name: string, password: string) => Promise<void>;
  logout: () => void;
  updateProvider: (value: string, skipValidation?: boolean) => Promise<void>;
  updateCDN: (value: string, skipValidation?: boolean) => Promise<void>;
  updateUserAgent: (value: string) => void;
  validateUrl: (url: string) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextInterface>({
  isSignedIn: false,
  profile: null,
  updateCurrentService: () => {},
  getCurrentService: () => services[ApiServiceType.REZKA],
  setAuthorization: () => {},
  login: async () => {},
  logout: () => {},
  updateProvider: async () => {},
  updateCDN: async () => {},
  updateUserAgent: () => {},
  validateUrl: async () => {},
});

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentService, setCurrentService] = useState<ApiServiceType>(ApiServiceType.REZKA);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!miscStorage.getString(CREDENTIALS_STORAGE));
  const [profile, setProfile] = useState<ProfileInterface | null>(
    safeJsonParse<ProfileInterface>(miscStorage.getString(PROFILE_STORAGE))
  );

  /**
   * Get the current service
   * @returns {ApiInterface} - The current service
   */
  const getCurrentService = useCallback(() => {
    return services[currentService];
  }, [currentService]);

  /**
   * Update the current service
   * @param {ApiServiceType} service - The service to set as current
   */
  const updateCurrentService = useCallback((service: ApiServiceType) => {
    setCurrentService(service);
  }, []);

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
   * Validate the URL for the current service
   * @param {string} url - The URL to validate
   */
  const validateUrl = useCallback(async (url: string, headers?: HeadersInit) => {
    await requestValidator(url, headers ?? getCurrentService().getHeaders());
  }, [getCurrentService]);

  /**
   * Update the provider for the current service
   * @param {string} value - The provider URL
   * @param {boolean} skipValidation - Whether to skip validation
   */
  const updateProvider = useCallback(async (value: string, skipValidation = false) => {
    if (!skipValidation) {
      const isWeb = Platform.OS === 'web';
      const url = isWeb ? REZKA_PROXY_PROVIDER : value;
      const headers = isWeb ? setProxyHeaders(getCurrentService().getHeaders(), value) : undefined;

      await validateUrl(url, headers);
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
    profile,
    updateCurrentService,
    getCurrentService,
    setAuthorization,
    removeProfile,
    login,
    logout,
    updateProvider,
    updateCDN,
    updateUserAgent,
    validateUrl,
  }), [
    isSignedIn,
    profile,
    updateCurrentService,
    getCurrentService,
    setAuthorization,
    removeProfile,
    login,
    logout,
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
