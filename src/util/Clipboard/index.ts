import Clipboard from '@react-native-clipboard/clipboard';

/**
 * Copies text to the system clipboard. Wrapped so swapping the clipboard
 * package out stays a one-file change instead of a hunt through the screens.
 */
export const copyToClipboard = (value: string): void => {
  Clipboard.setString(value);
};
