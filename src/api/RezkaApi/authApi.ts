import { cookiesManager } from 'Util/Cookies';

import { AuthApiInterface } from '..';
import configApi from './configApi';
import { JSONResult } from './utils';

const authApi: AuthApiInterface = {
  async login(name: string, password: string) {
    const data = await configApi.fetchJson<JSONResult>('/ajax/login/', {
      login_name: name,
      login_password: password,
      login_not_save: '0',
    });

    if (!data.success) {
      throw new Error(data.message);
    }

    return 'authorized';
  },
  async logout() {
    cookiesManager.reset();
  },
};

export default authApi;
