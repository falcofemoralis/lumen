import { MMKVLoader } from 'react-native-mmkv-storage';

export const cacheStorage = new MMKVLoader().withInstanceID('cache').initialize();

export const configStorage = new MMKVLoader().withInstanceID('config').initialize();
