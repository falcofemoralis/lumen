import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    padding: scale(20),
    flex: 1,
    justifyContent: 'center',
    gap: scale(16),
  },
  form: {
    marginTop: scale(16),
    gap: scale(8),
  },
  heading: {
    gap: scale(4),
    marginBottom: scale(8),
  },
  title: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  subtitle: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },
  input: {
    margin: scale(4),
  },
  action: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);
