import RezkaApi from './RezkaApi';

export type ApiInterface = typeof RezkaApi;

export enum ApiServiceType {
  REZKA = 'REZKA',
  // KINOKONG = 'KINOKONG',
}

export interface ApiParams {
  key?: string;
  isRefresh?: boolean;
}

export interface ServiceConfigInterface {
  provider: string;
  cdn: string;
  autoCdn: boolean;
  auth: string;
  userAgentNew: string;
  officialMode: string;
}
