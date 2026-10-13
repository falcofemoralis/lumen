import { Platform } from 'react-native';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale: baseScale, colors, text }: Theme) => {
  const scale = (value: number) => baseScale(value * (Platform.OS === 'web' ? 1.3 : 1));
  return ({
  container: {
    flex: 1,
    zIndex: 2,
    marginTop: scale(8),
  },
  pager: {
    flex: 1,
    minWidth: 0,
  },
  page: {
    width: '100%',
    height: '100%',
  },
  menuRow: {
    paddingLeft: scale(21),
    paddingRight: scale(12),
    width: '100%',
    height: scale(42),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  menuListContainer: {
    flex: 1,
    minWidth: 0,
    height: scale(42),
  },
  menuListWrapper: {
    zIndex: 10,
    height: scale(42),
    flexGrow: 0,
    flexShrink: 0,
  },
  menuList: {
    gap: scale(8),
  },
  menuTrailing: {
    width: scale(44),
    height: scale(42),
    marginLeft: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    height: scale(42),
    backgroundColor: colors.transparent,
    justifyContent: 'center',
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparent,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: scale(text.xs.fontSize),
    opacity: 0.7,
  },
  tabTextActive: {
    color: '#FFFFFF',
    opacity: 1,
    fontWeight: 'bold',
  },
  tabTextFocused: {
    color: '#FFFFFF',
    opacity: 1,
  },
} satisfies ThemedStyles);
};
