import { ApiInterface, ApiServiceType } from '.';
import RezkaApi from './RezkaApi';

export const services: Record<ApiServiceType, ApiInterface> = {
  rezka: RezkaApi,
  // kinokong: KinoKongApi,
};
