import ApiInterface from '..';
import configApi from './configApi';
import filmApi from './filmApi';

const RezkaApi: ApiInterface = Object.assign(configApi, filmApi);

export default RezkaApi;
