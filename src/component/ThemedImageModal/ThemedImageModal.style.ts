import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  wrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topActionsButton: {
    position: 'absolute',
    top: scale(16),
    right: scale(16),
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