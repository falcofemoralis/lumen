import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.button,
    borderRadius: scale(8),
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(6),
  },
  text: {
    fontSize: scale(text.xs.fontSize),
  },
  textSelected: {
    color: colors.textOnTertiary,
  },
  textFocused: {
    color: colors.textFocused,
  },
  image: {
    backgroundColor: colors.transparent,
  },
  focused: {
    backgroundColor: colors.backgroundFocused,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },

} satisfies ThemedStyles);
