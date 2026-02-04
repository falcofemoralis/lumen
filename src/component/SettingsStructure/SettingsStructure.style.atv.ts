import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  tabContainer: {
    width: '50%',
    height: '100%',
  },
  tabContainerHidden: {
    height: 0,
    width: 0,
  },
  tab: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  tabButton: {
    paddingVertical: scale(2),
    paddingHorizontal: scale(12),
  },
} satisfies ThemedStyles);
