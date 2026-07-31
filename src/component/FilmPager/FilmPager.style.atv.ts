import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    flex: 1,
    zIndex: 2,
    marginTop: scale(8),
  },
  menuCollapse: {
    overflow: 'hidden',
  },
  menuListWrapper: {
    zIndex: 10,
    height: scale(42),
    flexGrow: 0,
    flexShrink: 0,
  },
  menuListWrapperWithSorting: {
    height: scale(48),
  },
  menuList: {
    gap: scale(8),
  },
  tabButton: {
    height: '100%',
    borderRadius: scale(44),
    backgroundColor: colors.transparent,
  },
  tabBarSorting: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  tabButtonSelected: {
    backgroundColor: colors.tertiary,
  },
  tabButtonFocused: {
    backgroundColor: colors.backgroundFocused,
  },
  sortingText: {
    color: colors.text,
    fontSize: scale(12),
  },
  sortingTextFocused: {
    color: colors.textFocused,
  },
} satisfies ThemedStyles);
