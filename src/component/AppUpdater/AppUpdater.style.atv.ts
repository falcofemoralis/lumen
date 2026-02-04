import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  loadingContainer: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  overlay: {
    width: '40%',
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(8),
    marginTop: scale(16),
  },
  buttonContainer: {
    flex: 1,
  },
  button: {
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