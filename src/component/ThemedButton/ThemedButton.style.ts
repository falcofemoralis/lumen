import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.button,
    borderRadius: scale(8),
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
  },
  content: {
    padding: scale(12),
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
  },
  icon: {
    width: scale(16),
    alignSelf: 'center',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
  rightIcon: {
  },
  disabled: {
    opacity: 0.5,
  },
} satisfies ThemedStyles);