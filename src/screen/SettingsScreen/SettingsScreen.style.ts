import { ThemedStyles } from 'Theme/types';

export const componentStyles = () => ({
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  page: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
} satisfies ThemedStyles);
