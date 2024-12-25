import { ApiInterface } from '..';
import configApi from './configApi';
import filmApi from './filmApi';
import menuApi from './menuApi';
import playerApi from './playerApi';

const RezkaApi: ApiInterface = Object.assign(
  configApi,
  filmApi,
  menuApi,
  playerApi,
);

export default RezkaApi;
