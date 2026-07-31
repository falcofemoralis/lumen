import { Theme, ThemedStyles } from 'Theme/types';

export const ROW_GAP = 8;

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  header: {
    width: '100%',
    // Sticky headers float above the rows, so they need to be opaque.
    backgroundColor: colors.background,
  },
  headerText: {
    fontSize: scale(text.xl.fontSize),
    fontWeight: '700',
    paddingBottom: scale(4),
    marginBottom: scale(4),
  },
} satisfies ThemedStyles);
