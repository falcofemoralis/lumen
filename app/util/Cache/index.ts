import AsyncStorage from '@react-native-async-storage/async-storage';

import { Cache } from 'react-native-cache';

export const queryCache = new Cache({
  namespace: 'queryCache',
  policy: {
    maxEntries: 50000, // if unspecified, it can have unlimited entries
    stdTTL: 60, // the standard ttl as number in seconds, default: 0 (unlimited)
  },
  backend: AsyncStorage,
});
