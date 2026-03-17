import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  tabBarContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingBlock: scale(6),
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(6),
  },
  tabText: {
    color: colors.text,
    fontSize: scale(text.xxs.fontSize),
    opacity: 0.7,
    transitionProperty: 'opacity',
    transitionDuration: '250ms',
  },
  activeTabText: {
    fontWeight: 'bold',
    opacity: 1,
  },
  sortingText: {
    color: colors.text,
    fontSize: scale(text.xxs.fontSize),
    overflow: 'hidden',
  },
} satisfies ThemedStyles);
