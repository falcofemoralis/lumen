import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  container: {
    backgroundColor: colors.input,
    borderRadius: scale(16),
    paddingHorizontal: scale(8),
  },
  input: {
    color: colors.text,
  },
} satisfies ThemedStyles);
