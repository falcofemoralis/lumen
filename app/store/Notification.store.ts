import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line react-native/split-platform-components
import { ToastAndroid } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';

class NotificationStore {
  constructor() {
    makeAutoObservable(this);
  }

  async displayMessage(msg: any | string) {
    console.error(msg);
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }

  async displayError(error: string | unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(msg);
    ToastAndroid.show(msg, ToastAndroid.LONG);
  }
}

export default new NotificationStore();
