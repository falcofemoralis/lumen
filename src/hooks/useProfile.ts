import { useMMKVString } from 'react-native-mmkv';
import { PROFILE_STORAGE } from 'Store/Service.store';
import { ProfileInterface } from 'Type/Profile.interface';
import { safeJsonParse } from 'Util/Json';
import { miscStorage } from 'Util/Storage';

export const useProfile = () => {
  const [value] = useMMKVString(PROFILE_STORAGE, miscStorage);

  const profile = safeJsonParse<ProfileInterface>(value);

  return [profile];
};
