import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  input: {
    backgroundColor: colors.input,
    borderRadius: scale(16),
    paddingHorizontal: scale(8),
    color: colors.text,
    fontSize: scale(text.xs.fontSize),
  },
  inputFocus: {
    backgroundColor: colors.inputFocused,
    color: colors.textFocused,
  },
} satisfies ThemedStyles);
