import { PROFILE_STORAGE } from 'Context/ServiceContext';
import { useMMKVString } from 'react-native-mmkv';
import StorageStore from 'Store/Storage.store';
import { ProfileInterface } from 'Type/Profile.interface';
import { safeJsonParse } from 'Util/Json';

export const useProfile = () => {
  const [value] = useMMKVString(PROFILE_STORAGE, StorageStore.getMiscStorage());

  const profile = safeJsonParse<ProfileInterface>(value);

  return [profile];
};
