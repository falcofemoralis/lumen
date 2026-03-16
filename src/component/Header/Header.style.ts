import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    width: '100%',
    marginVertical: scale(8),
    zIndex: 10,
  },
  topActionsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(36),
    height: scale(36),
    borderRadius: scale(100),
    backgroundColor: colors.backgroundLighter,
  },
  topActionsButtonContent: {
    padding: scale(12),
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  title: {
    fontSize: scale(text.md.fontSize),
    fontWeight: 'bold',
  },
} satisfies ThemedStyles);