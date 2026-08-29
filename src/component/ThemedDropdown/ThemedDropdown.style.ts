import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  input: {
    backgroundColor: colors.backgroundLighter,
  },
  inputContent: {
    justifyContent: 'flex-start',
    gap: scale(8),
    padding: scale(8),
  },
  inputIcon: {
  },
  inputText: {
  },
  inputImage: {
    height: scale(20),
    width: scale(20),
    alignSelf: 'center',
  },
  overlay: {
    padding: scale(8),
  },
  // ThemedSimpleList already sizes itself to a whole number of rows that fits the
  // screen, so the overlay must not add a cap of its own (it defaults to 50% of
  // the screen, which clipped the last row).
  overlayContent: {
    width: '100%',
    flexDirection: 'row',
    maxHeight: '100%',
  },
} satisfies ThemedStyles);
