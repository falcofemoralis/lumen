import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type ThemedScrollViewContainerProps = {
  children?: ReactNode
  horizontal?: boolean
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  // TV related
  autofocus?: boolean
  /**
   * Focus resolving into the scroll view lands on the child closest to the
   * top-left corner, unless this names the one that should own its entry point
   * (norigin still restores the last focused child first).
   */
  preferredChildFocusKey?: string
  /**
   * Where a focused child is aligned inside the viewport, like FlashList's
   * scrollToIndex viewPosition: 0 = start, 0.5 = center, 1 = end. The alignment
   * is held on every focus change -- including when the child is already
   * visible -- so with 0.5 focus stays centred and the children that can be
   * focused next remain on screen. Near the ends of the content the scroll
   * clamps to the bounds, so the child settles short of the alignment.
   *
   * Left undefined the child is only nudged to the nearest edge when it is not
   * fully visible, so moving focus between on-screen children never scrolls.
   */
  viewPosition?: number
}

export type ThemedScrollViewComponentProps = ThemedScrollViewContainerProps;