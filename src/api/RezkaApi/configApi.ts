import { ApiServiceType, ConfigApiInterface, ServiceConfigInterface } from 'Api/index';
import __ from 'i18n/__';
import NotificationStore from 'Store/Notification.store';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { getConfigJson, updateConfig } from 'Util/Config';
import { safeJsonParse } from 'Util/Json';
import { HTMLElementInterface, parseHtml } from 'Util/Parser';
import { executeGet, executePost } from 'Util/Request';
import { updateUrlHost } from 'Util/Url';

import { Variables } from '../../util/Request/index';

const REZKA_CONFIG = 'rezkaConfig';

const configApi: ConfigApiInterface = {
  serviceType: ApiServiceType.REZKA,
  defaultProviders: [
    'https://rezka-ua.org',
  ],
  defaultCDNs: [
    'https://prx2-cogent.ukrtelcdn.net',
    'https://prx-ams.ukrtelcdn.net',
    'https://prx2-ams.ukrtelcdn.net',
    'http://ukrtelcdn.net',
    'https://stream.voidboost.cc',
    'https://stream.voidboost.top',
    'https://stream.voidboost.link',
    'https://stream.voidboost.club',
  ],
  config: null,

  loadConfig() {
    if (!this.config) {
      this.config = {
        provider: this.defaultProviders[0],
        cdn: 'auto',
        auth: '',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
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
    await updateConfig(REZKA_CONFIG, JSON.stringify({
      ...this.config,
      [key]: value,
    }));
  },

  setProvider(provider: string): void {
    this.updateConfig('provider', provider);
    this.loadConfig().provider = provider;
  },

  getProvider(): string {
    return this.loadConfig().provider;
  },

  setCDN(cdn: string): void {
    this.updateConfig('cdn', cdn);
    this.loadConfig().cdn = cdn;
  },

  getCDN(): string {
    return this.loadConfig().cdn;
  },

  setUserAgent(agent: string): void {
    this.updateConfig('userAgent', agent);
    this.loadConfig().userAgent = agent;
  },

  getUserAgent(): string {
    return this.loadConfig().userAgent;
  },

  setAuthorization(auth: string): void {
    this.updateConfig('auth', auth);
    this.loadConfig().auth = auth;
  },

  getAuthorization(): string {
    return this.loadConfig().auth;
  },

  getHeaders(): HeadersInit {
    const headers = {
      'User-Agent': this.getUserAgent(),
    };

    return headers;
  },

  parseContent(content: string): HTMLElementInterface {
    const page = parseHtml(content);
    const error = page.querySelector('.error-code');

    if (error) {
      NotificationStore.displayErrorScreen(
        page.querySelector('.error-code div')?.textContent,
        page.querySelector('.error-title')?.textContent,
        __('Try again later'),
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
    variables: Variables = {},
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
   * @param query
   * @param variables
   * @returns text
   */
  async getRequest(
    query: string,
    variables: Variables = {},
  ) {
    return executeGet(
      query,
      this.getProvider(),
      this.getHeaders(),
      variables,
    );
  },

  /**
   * Post request
   * @param query
   * @param variables
   * @returns JSON object
   */
  async postRequest(
    query: string,
    variables: Record<string, string> = {},
  ) {
    return executePost(
      `${query}/?t=${Date.now()}`,
      this.getProvider(),
      this.getHeaders(),
      variables,
    );
  },

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
};

export default configApi;
