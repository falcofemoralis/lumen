import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ colors }: Theme) => ({
  durationText: {
    color: colors.textOnContrast,
  },
} satisfies ThemedStyles);
