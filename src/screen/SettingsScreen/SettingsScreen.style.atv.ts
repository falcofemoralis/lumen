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
} satisfies ThemedStyles);
