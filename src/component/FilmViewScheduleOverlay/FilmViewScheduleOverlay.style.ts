import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
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
  item: {
    backgroundColor: colors.button,
  },
} satisfies ThemedStyles);
