import { ApiInterface } from 'Api/index';

export const createApi = (configModule: any, apiModules: any[]): ApiInterface => {
  return Object.assign(configModule, ...apiModules);
};