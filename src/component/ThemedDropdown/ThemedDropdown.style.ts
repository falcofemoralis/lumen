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
  overlayContent: {
    width: '100%',
    flexDirection: 'row',
  },
} satisfies ThemedStyles);
