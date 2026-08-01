import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // The sheet's content view is sized to the largest detent, so this must stay
  // top-aligned - anything centered lands below the visible area.
  loader: {
    paddingTop: scale(24),
  },
} satisfies ThemedStyles);
