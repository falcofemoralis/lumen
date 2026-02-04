import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text }: Theme) => ({
  overlay: {
    gap: scale(16),
    maxHeight: scale(288),
    width: scale(250),
  },
  overlayTitle: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '600',
  },
  overlayInput: {
  },
  overlayButton: {
  },
} satisfies ThemedStyles);
