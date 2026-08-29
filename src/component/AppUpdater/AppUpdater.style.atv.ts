import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  loadingContainer: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  // The overlay caps its content at a share of the screen and clips the rest, so
  // the card has to shrink into that box (RN defaults flexShrink to 0) -- only
  // the changelog scrolls, the actions stay visible.
  container: {
    flexShrink: 1,
  },
  overlay: {
    width: '40%',
    // The shared overlay caps every card at 50% of the screen, which leaves the
    // changelog a couple of lines tall -- release notes are the whole point of
    // this one, so give it most of the height and let the ScrollView take the rest.
    maxHeight: '80%',
    padding: scale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: scale(8),
  },
  headerIcon: {
    height: scale(32),
    width: scale(32),
  },
  headerText: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
    color: colors.textSecondary,
  },
  closeIcon: {
    height: scale(16),
    width: scale(16),
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: scale(50),
  },
  closeBtnContent: {
    padding: scale(8),
  },
  updateText: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
    marginTop: scale(16),
  },
  versionText: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },
  newText: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
    marginTop: scale(16),
  },
  descriptionText: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },
  description: {
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: scale(16),
    flexShrink: 0,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
  },
  updateButton: {
    backgroundColor: colors.secondary,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
} satisfies ThemedStyles);