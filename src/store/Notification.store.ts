import { router } from 'expo-router';
import { ToastAndroid } from 'react-native';

class NotificationStore {
  private isErrorOccurred = false;

  displayMessage(msg: string) {
    if (this.isErrorOccurred) {
      return;
    }

    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }

  displayError(error: string | Error) {
    if (this.isErrorOccurred) {
      return;
    }

    const msg = error instanceof Error ? error.message : String(error);

    console.error(msg);
    ToastAndroid.show(msg, ToastAndroid.LONG);
  }

  displayErrorScreen(code?: string, error?: string, info?: string) {
    if (this.isErrorOccurred) {
      return;
    }

    this.isErrorOccurred = true;

    router.replace({
      pathname: '/error',
      params: {
        code,
        error,
        info,
      },
    });
  }
}

export default new NotificationStore();
