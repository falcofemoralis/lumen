import { ApiServiceType } from '.';
import RezkaApi from './RezkaApi';

export const services: Record<ApiServiceType, typeof RezkaApi> = {
  REZKA: RezkaApi,
  // KINOKONG: KinoKongApi,
};
