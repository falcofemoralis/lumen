import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  mainContent: {
    flexDirection: 'row',
    gap: scale(24),
    width: '100%',
    paddingBottom: scale(8),
  },
  photo: {
    width: '15%',
    aspectRatio: '12 / 19',
    borderRadius: scale(16),
  },
  name: {
    fontSize: scale(text.xl.fontSize),
    lineHeight: scale(text.xl.lineHeight),
    fontWeight: '700',
    color: colors.text,
  },
  originalName: {
    fontSize: scale(text.sm.fontSize),
    lineHeight: scale(16),
    color: colors.textSecondary,
    opacity: 0.6,
    marginTop: scale(4),
  },
  text: {
    fontSize: scale(text.xs.fontSize),
  },
  additionalInfo: {
    flexDirection: 'column',
    gap: scale(8),
    marginTop: scale(8),
  },
} satisfies ThemedStyles);
