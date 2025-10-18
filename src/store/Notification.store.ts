import { ERROR_ROUTE } from 'Navigation/routes';
import { Platform, ToastAndroid } from 'react-native';

import { navigationRef } from '../navigation/container';

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

    navigationRef.current?.navigate(ERROR_ROUTE, {
      code,
      error,
      info,
    } as never);
  }
}

export default new NotificationStore();
