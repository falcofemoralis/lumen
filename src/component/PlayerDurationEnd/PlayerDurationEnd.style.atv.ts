import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  duration: {
    width: 'auto',
  },
  durationText: {
    fontSize: scale(text.sm.fontSize),
    textAlign: 'right',
    color: colors.textOnContrast,
  },
  clockText: {
    fontSize: scale(text.sm.fontSize),
    color: colors.textOnContrast,
  },
  remainingWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
} satisfies ThemedStyles);
