import { MMKVLoader } from 'react-native-mmkv-storage';

export const cacheStorage = new MMKVLoader().withInstanceID('cache').initialize();
