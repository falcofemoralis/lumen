import { t } from 'i18n/translate';
import { Linking } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { copyToClipboard } from 'Util/Clipboard';

/**
 * Helper for opening a give URL in an external browser.
 *
 * `Linking.canOpenURL` is deliberately not used as a gate here. For http(s) it
 * answers through Android package visibility, so it comes back false on any
 * device that has no app claiming https + BROWSABLE - a disabled browser, a
 * stripped-down ROM - and the press then does nothing at all, with no error to
 * show for it. Opening straight away and handling the failure means the user
 * always gets either the link or a way to reach it.
 */
export async function openLinkInBrowser(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    copyToClipboard(url);
    NotificationStore.displayError(t('No app can open this link, so it was copied instead'));
  }
}
