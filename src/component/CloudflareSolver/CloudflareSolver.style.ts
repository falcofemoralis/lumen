import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  // Above everything, because the request that raised it is blocked until it is
  // answered and there is nothing useful underneath to interact with meanwhile.
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(8),
    gap: scale(4),
  },
  title: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
  },
  hint: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },
  origin: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
} satisfies ThemedStyles);
