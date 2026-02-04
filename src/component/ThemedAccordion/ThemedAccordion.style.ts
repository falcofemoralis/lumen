import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  button: {
    justifyContent: 'flex-start',
    marginVertical: scale(4),
    borderRadius: scale(12),
    backgroundColor: colors.backgroundLight,
  },
  buttonContent: {
    padding: scale(12),
  },
} satisfies ThemedStyles);
