import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: scale(16),
  },
  form: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(16),
  },
  heading: {
    gap: scale(4),
    alignItems: 'center',
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
  inputContainer: {
    flexDirection: 'row',
  },
  input: {
  },
  button: {
    width: '100%',
    margin: scale(8),
  },
  overlay: {
    maxWidth: '50%',
  },
} satisfies ThemedStyles);
