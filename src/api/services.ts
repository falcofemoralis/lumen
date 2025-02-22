import { ApiInterface, ApiServiceType } from '.';
import RezkaApi from './RezkaApi';

export const services: Record<ApiServiceType, ApiInterface> = {
  REZKA: RezkaApi,
  // KINOKONG: KinoKongApi,
};
