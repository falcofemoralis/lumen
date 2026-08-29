import { ReactNode, RefObject } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedOverlayContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  useKeyboardAdjustment?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onShow?: () => void;
  /**
   * TV only. Which focusable owns the overlay's entry point on open. Norigin
   * resolves a claim on the overlay to the child closest to the top-left
   * corner otherwise, which is rarely the primary action -- a scroll view above
   * the actions row swallows it, and an empty one keeps focus on itself. The
   * child focused last still wins on re-open.
   */
  preferredChildFocusKey?: string;
}

export interface ThemedOverlayComponentProps {
  isOpened: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  contentVisible: boolean;
  useKeyboardAdjustment?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onShow?: () => void;
  handleModalRequestClose: () => void;
  preferredChildFocusKey?: string;
  // Mutable on purpose: the fallback can be set while the overlay is already
  // open (and is only read at teardown), so it must not go through props and
  // re-render the memoized overlay.
  fallbackRestoreFocusKeyRef?: RefObject<string | null>;
}

export type ThemedOverlayRef = {
  open: () => void;
  close: () => void;
  /**
   * TV only. Where focus goes on close when the node that opened the overlay is
   * no longer around -- which is what happens when the action taken in the
   * overlay removed it (deleting the very item that triggered it). Cleared on
   * every open; ignored while the trigger is still mounted.
   */
  setFallbackRestoreFocusKey: (focusKey: string | null) => void;
};
