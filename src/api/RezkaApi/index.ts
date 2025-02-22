import { ApiInterface } from '..';
import accountApi from './accountApi';
import authApi from './authApi';
import { commentsApi } from './commentsApi';
import configApi from './configApi';
import filmApi from './filmApi';
import menuApi from './menuApi';
import playerApi from './playerApi';
import searchApi from './searchApi';

const RezkaApi: ApiInterface = Object.assign(
  configApi,
  filmApi,
  menuApi,
  playerApi,
  authApi,
  accountApi,
  searchApi,
  commentsApi,
);

export default RezkaApi;
