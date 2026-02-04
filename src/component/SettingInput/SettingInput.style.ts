import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text }: Theme) => ({
  overlay: {
    gap: scale(16),
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
