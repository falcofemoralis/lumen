import ApiInterface from '..';
import configApi from './configApi';
import filmApi from './filmApi';

const RezkaApi: ApiInterface = {
  ...configApi,
  ...filmApi,
};

export default RezkaApi;
