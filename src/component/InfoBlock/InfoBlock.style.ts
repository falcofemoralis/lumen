import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    flexDirection: 'column',
    gap: scale(4),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(99),
    width: scale(36),
    height: scale(36),
  },
  title: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
    textAlign: 'center',
  },
} satisfies ThemedStyles);
