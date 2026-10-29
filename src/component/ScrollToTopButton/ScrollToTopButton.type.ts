export type ScrollToTopButtonCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ScrollToTopButtonComponentProps {
  /** Whether the grid has scrolled down far enough for the button to show. */
  visible: boolean;
  onPress: () => void;
}