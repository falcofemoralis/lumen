import { ApiServiceType, ConfigApiInterface } from 'Api/index';
import { parseHtml } from 'Util/Parser';
import { executeGet, executePost } from 'Util/Request';

const configApi: ConfigApiInterface = {
  serviceType: ApiServiceType.rezka,
  defaultProviders: ['https://rezka-ua.tv'],
  defaultCDNs: ['https://stream.voidboost.cc'],

  setProvider(provider: string): void {
    // TODO implement custom provider logic
  },

  getProvider(): string {
    // TODO implement custom provider logic
    return this.defaultProviders[0];
  },

  setAuthorization(auth: string): void {
    // TODO implement custom authorization logic
  },

  getAuthorization(): HeadersInit {
    // TODO need to add Cookie header

    const agent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    return {
      'User-Agent': agent,
    };
  },

  /**
   * Fetch page
   * @param query
   * @param variables
   * @param ignoreCache
   * @returns DOM doc
   */
  async fetchPage(query: string, variables: Record<string, string> = {}, ignoreCache = false) {
    const res = await executeGet(
      query,
      this.getProvider(),
      this.getAuthorization(),
      variables,
      ignoreCache
    );

    return parseHtml(res);
  },

  /**
   * Get request
   * @param query
   * @param variables
   * @returns text
   */
  async getRequest(query: string, variables: Record<string, string> = {}) {
    return await executeGet(query, this.getProvider(), this.getAuthorization(), variables);
  },

  /**
   * Post request
   * @param query
   * @param variables
   * @returns JSON object
   */
  async postRequest(query: string, variables: Record<string, string> = {}, ignoreCache = false) {
    const result = await executePost(
      `${query}/?t=${Date.now()}`,
      this.getProvider(),
      this.getAuthorization(),
      variables
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  },
};

export default configApi;
