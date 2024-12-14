import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line react-native/split-platform-components
import { ToastAndroid } from 'react-native';

class NotificationStore {
  constructor() {
    makeAutoObservable(this);
  }

  async displayMessage(msg: any | string) {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }

  async displayError(error: string | unknown) {
    const msg = error instanceof Error ? error.message : String(error);

    // TODO show error screen

    console.error(msg);

    ToastAndroid.show(msg, ToastAndroid.LONG);
  }
}

export default new NotificationStore();
