import RezkaApi from './RezkaApi';
import { ApiInterface, ApiServiceType } from './type';

export const services: Record<ApiServiceType, ApiInterface> = {
  [ApiServiceType.REZKA]: RezkaApi,
};

export const DEFAULT_SERVICE = ApiServiceType.REZKA;