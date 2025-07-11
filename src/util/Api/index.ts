import { ApiInterface } from 'Api/index';

export const createApi = (apiModules: any[]): ApiInterface => {
  return Object.assign({}, ...apiModules);
};