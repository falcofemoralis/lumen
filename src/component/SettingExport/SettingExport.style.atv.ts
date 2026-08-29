import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  // The list caps its own height at a whole number of rows, so the overlay must not add
  // a cap of its own. The width is fixed instead of following the content: the rows are
  // short, and the note under them would otherwise decide how wide the panel is.
  overlay: {
    width: scale(360),
    maxHeight: '100%',
  },
  container: {
    padding: scale(8),
    flexDirection: 'column',
    gap: scale(12),
  },
  note: {
    fontSize: scale(text.sm.fontSize),
    opacity: 0.7,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'flex-end',
  },
  button: {
    flex: 0,
    paddingInline: scale(20),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);
