import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    width: '100%',
    height: '100%',
  },
  menuListWrapper: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: colors.background,
    marginBottom: scale(16),
    height: scale(46),
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
    gap: 0,
    paddingVertical: scale(6),
  },
  tabBarSorting: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortingText: {
    color: colors.text,
    fontSize: scale(text.xxs.fontSize),
    overflow: 'hidden',
  },
  sortingTextFocused: {
    color: colors.textFocused,
  },
} satisfies ThemedStyles);
