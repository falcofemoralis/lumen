import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  input: {
    borderRadius: scale(12),
    justifyContent: 'flex-start',
  },
  inputContent: {
    justifyContent: 'flex-start',
  },
  inputFocused: {
  },
  inputText: {
  },
  inputTextFocused: {
  },
  inputImage: {
    height: scale(20),
    width: scale(20),
    alignSelf: 'center',
  },
  container: {
  },
  // ThemedSimpleList already sizes itself to a whole number of rows that fits the
  // screen, so the overlay must not add a cap of its own (it defaults to 50% of
  // the screen, which clipped the last row).
  contentContainer: {
    maxHeight: '100%',
  },
} satisfies ThemedStyles);
