import { ApiServiceType, ConfigApiInterface } from 'Api/index';
import { fetchPage } from 'Util/Request/Query';

const configApi: ConfigApiInterface = {
  serviceType: ApiServiceType.rezka,
  defaultProviders: ['https://rezka-ua.tv'],

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

  async fetchPage(query: string, variables: Record<string, string> = {}, ignoreCache = false) {
    return await fetchPage(
      query,
      this.getProvider(),
      this.getAuthorization(),
      variables,
      ignoreCache
    );
  },
};

export default configApi;