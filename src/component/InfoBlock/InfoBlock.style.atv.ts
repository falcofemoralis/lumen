import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    gap: scale(8),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(99),
    width: scale(42),
    height: scale(42),
  },
  title: {
    fontSize: scale(text.xl.fontSize),
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(text.sm.fontSize),
    color: colors.textSecondary,
    textAlign: 'center',
  },
} satisfies ThemedStyles);
