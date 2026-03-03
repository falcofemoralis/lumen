import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    backgroundColor: colors.button,
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderWidth: 0,
    flexDirection: 'row',
    gap: scale(6),
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: scale(text.xs.fontSize),
  },
  // filled
  containerFilled: {
    borderRadius: scale(44),
  },
  containerFilledSelected: {
    backgroundColor: colors.primary,
  },
  containerFilledFocused: {
    backgroundColor: colors.buttonFocused,
  },
  containerFilledDisabled: {
    opacity: 0.5,
  },
  textFilled: {
    color: colors.text,
  },
  textFilledSelected: {
    color: colors.textOnTertiary,
  },
  textFilledFocused: {
    color: colors.textFocused,
  },
  icon: {
    width: scale(18),
    height: scale(18),
  },
  iconFilled: {
    color: colors.text,
  },
  iconFilledSelected: {},
  iconFilledFocused: {
    color: colors.textFocused,
  },
  // outlined
  containerOutlined: {
    borderRadius: scale(44),
    backgroundColor: colors.transparent,
  },
  containerOutlinedSelected: {
    backgroundColor: colors.tertiary,
  },
  containerOutlinedFocused: {
    backgroundColor: colors.backgroundFocused,
  },
  textOutlined: {
    color: colors.text,
  },
  textOutlinedSelected: {
    color: colors.textOnTertiary,
  },
  textOutlinedFocused: {
    color: colors.textFocused,
  },
  iconOutlined: {
    color: colors.text,
  },
  iconOutlinedSelected: {
    color: colors.textOnTertiary,
  },
  iconOutlinedFocused: {
    color: colors.textFocused,
  },
  rightIcon: {
  },
  // long
  containerLong: {
    borderRadius: scale(44),
  },
  containerLongSelected: {
    backgroundColor: colors.primary,
  },
  containerLongFocused: {
    backgroundColor: colors.buttonFocused,
  },
  // transparent
  textLongSelected: {
    color: colors.textOnTertiary,
  },
  textLongFocused: {
    color: colors.textFocused,
  },
} satisfies ThemedStyles);
