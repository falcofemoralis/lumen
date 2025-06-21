import { MMKV } from 'react-native-mmkv';

export const configStorage = new MMKV({ id: 'config' });

export const cookiesStorage = new MMKV({ id: 'cookies' });

export const playerStorage = new MMKV({ id: 'player' });

export const miscStorage = new MMKV({ id: 'misc' });
