import { ApiServiceType, ConfigApiInterface } from 'Api/index';
import NotificationStore from 'Store/Notification.store';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { safeJsonParse } from 'Util/Json';
import { HTMLElementInterface, parseHtml } from 'Util/Parser';
import { executeGet, executePost } from 'Util/Request';
import { configStorage } from 'Util/Storage';
import { updateUrlHost } from 'Util/Url';

import { Variables } from '../../util/Request/index';

const configApi: ConfigApiInterface = {
  serviceType: ApiServiceType.REZKA,
  defaultProviders: ['https://rezka-ua.org'],
  /**
   *    <item>prx.ukrtelcdn.net</item>
        <item>prx-ams.ukrtelcdn.net</item>
        <item>prx2-ams.ukrtelcdn.net</item>
        <item>ukrtelcdn.net</item>
        <item>stream.voidboost.top</item>
        <item>stream.voidboost.link</item>
        <item>stream.voidboost.club</item>
        <item>stream.voidboost.cc</item>

        https://prx2-cogent.ukrtelcdn.net
   */
  /**
   *
   *    <item>None</item>
        <item>https://1.1.1.1/dns-query;1.1.1.1;1.0.0.1</item>
        <item>https://dns.google/dns-query;8.8.8.8;8.8.4.4</item>
        <item>https://dns.adguard-dns.com/dns-query;94.140.14.14;94.140.15.15</item>
        <item>https://unfiltered.adguard-dns.com/dns-query;94.140.14.140;94.140.14.141</item>
        <item>https://common.dot.dns.yandex.net/dns-query;77.88.8.1;77.88.8.8</item>
   */
  defaultCDNs: [
    'https://prx2-cogent.ukrtelcdn.net',
    'https://stream.voidboost.cc',
  ],
  config: null,

  formatConfigKey(key: string) {
    return `${this.serviceType}_${key}`;
  },

  getConfig() {
    if (!this.config) {
      this.config = {
        provider: configStorage.getString(this.formatConfigKey('provider')) ?? this.defaultProviders[0],
        cdn: configStorage.getString(this.formatConfigKey('cdn')) ?? this.defaultCDNs[0],
        auth: configStorage.getString(this.formatConfigKey('auth')) ?? '',
      };
    }

    return this.config;
  },

  setProvider(provider: string): void {
    configStorage.setStringAsync(this.formatConfigKey('provider'), provider);
    this.getConfig().provider = provider;
  },

  getProvider(): string {
    return this.getConfig().provider;
  },

  setCDN(cdn: string): void {
    configStorage.setStringAsync(this.formatConfigKey('cdn'), cdn);
    this.getConfig().cdn = cdn;
  },

  getCDN(): string {
    return this.getConfig().cdn;
  },

  setAuthorization(auth: string): void {
    configStorage.setStringAsync(this.formatConfigKey('auth'), auth);
    this.getConfig().auth = auth;
  },

  getAuthorization(): string {
    const { auth } = this.getConfig();

    return auth;
  },

  getHeaders(): HeadersInit {
    const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0';

    const headers = {
      'User-Agent': agent,
    };

    //
    // Rezka authorization works with cookies and we manage them automatically through fetch api
    //
    // if (this.getAuthorization()) {
    //   Object.assign(headers, {
    //     Cookie: this.getAuthorization(),
    //   });
    // }

    return headers;
  },

  parseContent(content: string): HTMLElementInterface {
    const page = parseHtml(content);
    const error = page.querySelector('.error-code');

    if (error) {
      NotificationStore.displayErrorScreen(
        page.querySelector('.error-code div')?.textContent,
        page.querySelector('.error-title')?.textContent,
        'Повторите попытку чуть позже',
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
    return streams.map((stream) => {
      const { url } = stream;

      return {
        ...stream,
        url: updateUrlHost(url, this.getCDN()),
      };
    });
  },
};

export default configApi;
