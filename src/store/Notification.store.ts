import { t } from 'i18n/translate';
import { ERROR_SCREEN } from 'Navigation/navigationRoutes';
import { ToastAndroid } from 'react-native';
import { navigate } from 'Util/Navigation';

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

    if (__DEV__) {
      console.error(msg);
      console.trace();
    }

    let formattedMsg = msg;
    switch (msg) {
      case 'TypeError: Network request failed':
        formattedMsg = t('Network request failed. Please check your internet connection and try again.');
        break;
      default:
        break;
    }

    ToastAndroid.show(formattedMsg, ToastAndroid.LONG);
  }

  displayErrorScreen(code?: string, error?: string, info?: string) {
    if (this.isErrorOccurred) {
      return;
    }

    this.isErrorOccurred = true;

    navigate(ERROR_SCREEN, {
      code,
      error,
      info,
    } as never);
  }
}

export default new NotificationStore();
