import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text }: Theme) => ({
  overlay: {
    gap: scale(16),
    width: scale(250),
  },
  overlayTitle: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
  },
  overlayInput: {
  },
  overlayButton: {
  },
} satisfies ThemedStyles);
