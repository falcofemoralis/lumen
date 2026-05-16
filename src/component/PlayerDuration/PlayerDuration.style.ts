import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  durationText: {
    color: colors.textOnContrast,
  },
} satisfies ThemedStyles);
