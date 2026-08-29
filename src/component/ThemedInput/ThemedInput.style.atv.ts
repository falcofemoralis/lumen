import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  inputContainer: {
    // Takes the leftover row width instead of `100%`, which would push the
    // secure icon out of the wrapper.
    flex: 1,
  },
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
  secureIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(99),
  },
  secureIconInner: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureIconFocused: {
    borderRadius: scale(99),
    backgroundColor: colors.inputFocused,
  },
} satisfies ThemedStyles);
