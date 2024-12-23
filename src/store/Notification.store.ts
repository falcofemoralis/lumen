import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line react-native/split-platform-components -- App is android only
import { ToastAndroid } from 'react-native';

class NotificationStore {
  constructor() {
    makeAutoObservable(this);
  }

  async displayMessage(msg: string) {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }

  async displayError(error: string | Error) {
    const msg = error instanceof Error ? error.message : String(error);

    // TODO show error screen

    console.error(msg);

    ToastAndroid.show(msg, ToastAndroid.LONG);
  }
}

export default new NotificationStore();
