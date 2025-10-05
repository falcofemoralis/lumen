/* eslint-disable max-len */
import { ApiServiceType, ConfigApiInterface, ServiceConfigInterface } from 'Api/index';
import * as Device from 'expo-device';
import t from 'i18n/t';
import { Platform } from 'react-native';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { ModifiedProvider } from 'Type/ModifiedProvider.interface';
import { getConfigJson, updateConfig } from 'Util/Config';
import { safeJsonParse } from 'Util/Json';
import { HTMLElementInterface, parseHtml } from 'Util/Parser';
import { addProxyHeaders, executeGet, executePost, Variables } from 'Util/Request';
import { updateUrlHost } from 'Util/Url';

const REZKA_CONFIG = 'rezkaConfig';

const REZKA_PROXY_PROVIDER = process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:3000';

const configApi: ConfigApiInterface = {
  serviceType: ApiServiceType.REZKA,
  defaultProviders: [
    'https://rezka-ua.org',
  ],
  defaultCDNs: [
    'https://prx-cogent.ukrtelcdn.net',
    'https://prx2-cogent.ukrtelcdn.net',
    'https://prx3-cogent.ukrtelcdn.net',
    'https://prx4-cogent.ukrtelcdn.net',
    'https://prx5-cogent.ukrtelcdn.net',
    'https://prx6-cogent.ukrtelcdn.net',
    'https://stream.voidboost.cc',
    'https://stream.voidboost.top',
    'https://stream.voidboost.link',
    'https://stream.voidboost.club',
  ],
  defaultUserAgent: `Mozilla/5.0 (Linux; Android ${Device.osVersion}; ${Device.manufacturer} ${Device.modelName}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36`,
  officialMirrors: [
    {
      label: t('Off'),
      value: '',
    },
    {
      label: t('Main'),
      value: 'https://hdrzk.org',
    },
    {
      label: t('Additional'),
      value: 'https://stepnet.video',
    },
  ],
  config: null,

  loadConfig() {
    if (!this.config) {
      this.config = {
        provider: this.defaultProviders[0],
        cdn: 'auto',
        auth: '',
        userAgentNew: this.defaultUserAgent,
        officialMode: '',
      };

      const config = getConfigJson<ServiceConfigInterface>(REZKA_CONFIG);

      if (config) {
        this.config = {
          ...this.config,
          ...config,
        };
      }
    }

    return this.config;
  },

  async updateConfig(key: keyof ServiceConfigInterface, value: unknown) {
    updateConfig(REZKA_CONFIG, JSON.stringify({
      ...this.config,
      [key]: value,
    }));
  },

  setProvider(provider: string): void {
    this.updateConfig('provider', provider);
    this.loadConfig().provider = provider;
  },

  getDefaultProvider(): string {
    return this.loadConfig().provider;
  },

  getProvider(): string {
    if (this.isOfficialMode()) {
      return this.getOfficialMode();
    }

    return this.getDefaultProvider();
  },

  setCDN(cdn: string): void {
    this.updateConfig('cdn', cdn);
    this.loadConfig().cdn = cdn;
  },

  getCDN(): string {
    return this.loadConfig().cdn;
  },

  setUserAgent(agent: string): void {
    this.updateConfig('userAgentNew', agent);
    this.loadConfig().userAgentNew = agent;
  },

  getUserAgent(): string {
    return this.loadConfig().userAgentNew;
  },

  setAuthorization(auth: string): void {
    this.updateConfig('auth', auth);
    this.loadConfig().auth = auth;
  },

  getAuthorization(): string {
    return this.loadConfig().auth;
  },

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'User-Agent': this.getUserAgent(),
    };

    if (this.isOfficialMode()) {
      headers['X-Hdrezka-Android-App'] = '1';
      headers['X-Hdrezka-Android-App-Version'] = '2.2.1';
    }

    return headers;
  },

  getProxyHeaders(): HeadersInit {
    const headers = this.getHeaders();

    return addProxyHeaders(headers, this.getProvider());
  },

  parseContent(content: string): HTMLElementInterface {
    const page = parseHtml(content);
    const error = page.querySelector('.error-code');

    if (error) {
      NotificationStore.displayErrorScreen(
        page.querySelector('.error-code div')?.textContent,
        page.querySelector('.error-title')?.textContent,
        t('Try again later')
      );
      throw new Error('Service temporarily unavailable');
    }

    return page;
  },

  /**
   * Fetch page
   * @param query
   * @param variables
   * @returns HTMLElement
   */
  async fetchPage(
    query: string,
    variables: Variables = {}
  ) {
    const res = await this.getRequest(query, variables);

    return this.parseContent(res);
  },

  async fetchJson<T>(query: string, variables: Variables = {}) {
    const result = await this.postRequest(query, variables);

    const json = safeJsonParse<T>(result);

    return json;
  },

  /**
   * Get request
   * @param queryInput
   * @param variables
   * @returns text
   */
  async getRequest(
    queryInput: string,
    variables: Variables = {}
  ) {
    const { query, provider } = this.modifyProvider(queryInput);
    const headers = Platform.OS === 'web' ? this.getProxyHeaders() : this.getHeaders();

    LoggerStore.debug('configApi::getRequest', { query, provider, variables });

    return executeGet(
      query,
      provider,
      headers,
      variables
    );
  },

  /**
   * Post request
   * @param queryInput
   * @param variables
   * @returns JSON object
   */
  async postRequest(
    queryInput: string,
    variables: Record<string, string> = {}
  ) {
    const { query, provider } = this.modifyProvider(queryInput);
    const headers = Platform.OS === 'web' ? this.getProxyHeaders() : this.getHeaders();

    if (!query.includes('/login')) {
      // do not include login request
      LoggerStore.debug('configApi::postRequest', { query, provider, variables });
    }

    return executePost(
      `${query}/?t=${Date.now()}`,
      provider,
      headers,
      variables
    );
  },

  /**
   * Modify CDN for streams
   * @param streams
   * @returns streams with modified URLs
   */
  modifyCDN(streams: FilmStreamInterface[]) {
    const cdn = this.getCDN();

    if (cdn === 'auto') {
      return streams;
    }

    return streams.map((stream) => {
      const { url } = stream;

      return {
        ...stream,
        url: updateUrlHost(url, cdn),
      };
    });
  },

  /**
   * Modify provider URL
   * @param query
   * @returns ModifiedUrl
   */
  modifyProvider(query: string): ModifiedProvider {
    const isWeb = Platform.OS === 'web';

    return {
      query: isWeb ? updateUrlHost(query, REZKA_PROXY_PROVIDER) : query,
      provider: isWeb ? REZKA_PROXY_PROVIDER : this.getProvider(),
    };
  },

  /**
   * Set official mode
   * @param mode
   */
  setOfficialMode(mode: string): void {
    this.updateConfig('officialMode', mode);
    this.loadConfig().officialMode = mode;
  },

  /**
   * Get official mode
   * @returns string
   */
  getOfficialMode(): string {
    return this.loadConfig().officialMode;
  },

  /**
   * Check if official mode is enabled
   * @returns boolean
   */
  isOfficialMode() {
    return !!this.getOfficialMode();
  },
};

export { REZKA_PROXY_PROVIDER };

export default configApi;
