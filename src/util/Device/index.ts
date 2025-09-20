import { Platform } from 'react-native';
import RNRestart from 'react-native-restart';

export const restartApp = () => {
  if (Platform.OS === 'web') {
    location.replace('/');
  } else {
    RNRestart.restart();
  }
};