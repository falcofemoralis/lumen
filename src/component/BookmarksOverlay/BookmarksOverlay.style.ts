import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  // ThemedSimpleList already sizes itself to a whole number of rows that fits the
  // screen, so the overlay must not add a cap of its own (it defaults to 50% of
  // the screen, which clips the last row).
  overlayContent: {
    maxHeight: '100%',
  },
  createContainer: {
    padding: scale(8),
    flexDirection: 'column',
    gap: scale(16),
  },
  input: {
    width: '100%',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'flex-end',
    paddingTop: scale(8),
  },
  button: {
    flex: 1,
  },
  buttonContent: {
    paddingInline: scale(20),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);
