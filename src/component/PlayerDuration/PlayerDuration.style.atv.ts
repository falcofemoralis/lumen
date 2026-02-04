import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text }: Theme) => ({
  duration: {
    width: 'auto',
  },
  durationText: {
    fontSize: scale(text.sm.fontSize),
    textAlign: 'right',
  },
} satisfies ThemedStyles);
