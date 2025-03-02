import { useMMKVStorage } from 'react-native-mmkv-storage';
import { PROFILE_STORAGE } from 'Store/Service.store';
import { ProfileInterface } from 'Type/Profile.interface';
import { safeJsonParse } from 'Util/Json';
import { miscStorage } from 'Util/Storage';

export const useProfile = () => {
  const [value] = useMMKVStorage(PROFILE_STORAGE, miscStorage, null);

  const profile = safeJsonParse<ProfileInterface>(value);

  return [profile];
};
