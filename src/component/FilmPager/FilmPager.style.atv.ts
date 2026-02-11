import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  container: {
    width: '100%',
    height: '100%',
  },
  menuListWrapper: {
    position: 'relative',
    height: scale(40),
    zIndex: 10,
    backgroundColor: colors.background,
    marginBottom: scale(16),
  },
  menuListScroll: {},
  menuList: {
    gap: scale(8),
  },
  grid: {
    zIndex: 2,
  },
  tabButton: {
    height: '100%',
  },
} satisfies ThemedStyles);
