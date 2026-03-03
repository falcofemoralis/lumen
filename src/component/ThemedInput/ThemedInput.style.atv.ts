import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(8),
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: scale(16),
    paddingHorizontal: scale(8),
    color: colors.text,
    fontSize: scale(text.xs.fontSize),
  },
  inputPressable: {
    width: '100%',
    backgroundColor: 'green',
  },
  inputFocus: {
    backgroundColor: colors.inputFocused,
    color: colors.textFocused,
  },
  secureIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  secureIconInner: {
    width: scale(40),
    height: '100%',
    borderRadius: scale(99),
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureIconFocused: {
    borderRadius: scale(99),
    backgroundColor: colors.inputFocused,
  },
} satisfies ThemedStyles);
