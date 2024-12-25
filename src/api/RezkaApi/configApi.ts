import { ApiServiceType, ConfigApiInterface } from 'Api/index';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { parseHtml } from 'Util/Parser';
import { executeGet, executePost } from 'Util/Request';
import { updateUrlHost } from 'Util/Url';

import { Variables } from '../../util/Request/index';
import { JSONResult } from './utils';

const configApi: ConfigApiInterface = {
  serviceType: ApiServiceType.rezka,
  defaultProviders: ['https://rezka-ua.tv'],
  defaultCDNs: ['https://prx-cogent.ukrtelcdn.net', 'https://stream.voidboost.cc'],
  selectedProvider: null,
  selectedCDN: null,

  setProvider(provider: string): void {
    this.selectedProvider = provider;
  },

  getProvider(): string {
    return this.selectedProvider ?? this.defaultProviders[0];
  },

  setCDN(cdn: string): void {
    this.selectedCDN = cdn;
  },

  getCDN(): string {
    return this.selectedCDN ?? this.defaultCDNs[0];
  },

  setAuthorization(auth: string): void {
    // TODO implement custom authorization logic
  },

  getAuthorization(): HeadersInit {
    // TODO need to add Cookie header

    const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    return {
      'User-Agent': agent,
    };
  },

  /**
   * Fetch page
   * @param query
   * @param variables
   * @param ignoreCache
   * @returns HTMLElement
   */
  async fetchPage(query: string, variables: Variables = {}, ignoreCache = false) {
    const res = await this.getRequest(query, variables, ignoreCache);

    return parseHtml(res);
  },

  async fetchJson<T>(query: string, variables: Variables = {}) {
    const result = await this.postRequest(query, variables);

    const json = JSON.parse(result) as T;

    return json;
  },

  /**
   * Get request
   * @param query
   * @param variables
   * @returns text
   */
  async getRequest(query: string, variables: Variables = {}, ignoreCache = false) {
    return executeGet(query, this.getProvider(), this.getAuthorization(), variables, ignoreCache);
  },

  /**
   * Post request
   * @param query
   * @param variables
   * @returns JSON object
   */
  async postRequest(query: string, variables: Record<string, string> = {}, ignoreCache = true) {
    return executePost(
      `${query}/?t=${Date.now()}`,
      this.getProvider(),
      this.getAuthorization(),
      variables,
      ignoreCache,
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
