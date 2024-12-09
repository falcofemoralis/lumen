import ApiInterface from '..';
import configApi from './configApi';
import filmApi from './filmApi';
import menuApi from './menuApi';

const RezkaApi: ApiInterface = Object.assign(configApi, filmApi, menuApi);

export default RezkaApi;
