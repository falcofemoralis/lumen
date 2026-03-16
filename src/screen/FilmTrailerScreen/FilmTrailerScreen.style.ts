import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  modal: {
    backgroundColor: colors.background,
  },
  container: {
    position: 'relative',
    maxHeight: '100%',
    maxWidth: '100%',
    padding: 0,
    borderWidth: 0,
    right: 0,
    backgroundColor: colors.background,
  },
  wrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActionsButton: {
    position: 'absolute',
    top: scale(16),
    left: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(36),
    height: scale(36),
    borderRadius: scale(100),
    backgroundColor: colors.backgroundLighter,
    zIndex: 1,
  },
  topActionsButtonContent: {
    padding: scale(12),
  },
} satisfies ThemedStyles);