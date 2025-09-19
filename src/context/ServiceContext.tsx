import { ApiInterface, ApiServiceType } from 'Api/index';
import { REZKA_PROXY_PROVIDER } from 'Api/RezkaApi/configApi';
import { services } from 'Api/services';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import t from 'i18n/t';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Linking, Platform } from 'react-native';
import StorageStore from 'Store/Storage.store';
import { ProfileInterface } from 'Type/Profile.interface';
import { CookiesManager } from 'Util/Cookies';
import { safeJsonParse } from 'Util/Json';
import { addProxyHeaders, requestValidator } from 'Util/Request';

export const CREDENTIALS_STORAGE = 'CREDENTIALS_STORAGE';
export const PROFILE_STORAGE = 'PROFILE_STORAGE';

export const DEFAULT_SERVICE = ApiServiceType.REZKA;

interface ServiceContextInterface {
  isSignedIn: boolean;
  profile: ProfileInterface | null;
  currentService: ApiInterface;
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
}

const ServiceContext = createContext<ServiceContextInterface>({
  isSignedIn: false,
  profile: null,
  currentService: services[DEFAULT_SERVICE],
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
});

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentService, setCurrentService] = useState<ApiInterface>(services[DEFAULT_SERVICE]);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!StorageStore.getMiscStorage().getString(CREDENTIALS_STORAGE));
  const [profile, setProfile] = useState<ProfileInterface | null>(
    safeJsonParse<ProfileInterface>(StorageStore.getMiscStorage().getString(PROFILE_STORAGE))
  );

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
    StorageStore.getMiscStorage().set(CREDENTIALS_STORAGE, JSON.stringify({ name, password }));
  }, [currentService]);

  /**
   * Load the profile for the current service
   */
  const loadProfile = useCallback(async () => {
    const value = await currentService.getProfile();

    StorageStore.getMiscStorage().set(PROFILE_STORAGE, JSON.stringify(value));
    setProfile(value);
  }, [currentService]);

  /**
   * Remove the profile for the current service
   */
  const removeProfile = useCallback(() => {
    StorageStore.getMiscStorage().delete(PROFILE_STORAGE);
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
    StorageStore.getMiscStorage().set(CREDENTIALS_STORAGE, '');
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
      const { name, password } = safeJsonParse<{ name: string; password: string }>(
        StorageStore.getMiscStorage().getString(CREDENTIALS_STORAGE)
      ) ?? {};

      logout();

      if (name && password) {
        await login(name, password);
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
      const isWeb = Platform.OS === 'web';
      const url = isWeb ? REZKA_PROXY_PROVIDER : value;
      const headers = isWeb ? addProxyHeaders(currentService.getHeaders(), value) : undefined;

      await validateUrl(url, headers);
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

  const value = useMemo(() => ({
    isSignedIn,
    profile,
    currentService,
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
  }), [
    isSignedIn,
    profile,
    currentService,
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
  ]);

  return (
    <ServiceContext.Provider value={ value }>
      { children }
    </ServiceContext.Provider>
  );
};

export const useServiceContext = () => use(ServiceContext);
