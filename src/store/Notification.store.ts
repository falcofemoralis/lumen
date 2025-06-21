import { router } from 'expo-router';
import { Platform, ToastAndroid } from 'react-native';

class NotificationStore {
  private isErrorOccurred = false;

  displayMessage(msg: string) {
    if (this.isErrorOccurred) {
      return;
    }

    if (Platform.OS === 'web') {
      // For web, we can use the browser's alert or implement a custom toast
      // You might want to use a proper toast library for better UX
      alert(msg);
    } else {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
  }

  displayError(error: string | Error) {
    if (this.isErrorOccurred) {
      return;
    }

    const msg = error instanceof Error ? error.message : String(error);

    console.error(msg);

    if (Platform.OS === 'web') {
      // For web, we can use the browser's alert or implement a custom toast
      // You might want to use a proper toast library for better UX
      alert(msg);
    } else {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    }
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
