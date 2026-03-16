import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    marginHorizontal: scale(16),
  },
  scroll: {
    marginVertical: scale(16),
    borderRadius: scale(8),
    maxHeight: '40%',
    backgroundColor: colors.divider,
  },
  scrollContent: {
    padding: scale(8),
  },
  title: {
    fontSize: scale(48),
    fontWeight: '300',
    paddingBottom: scale(16),
  },
  subtitle: {
    fontSize: scale(32),
    fontWeight: '800',
  },
  error: {
    paddingVertical: scale(16),
    color: colors.error,
    fontWeight: 'bold',
  },
  errorBacktrace: {
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: scale(50),
    width: scale(200),
  },
} satisfies ThemedStyles);