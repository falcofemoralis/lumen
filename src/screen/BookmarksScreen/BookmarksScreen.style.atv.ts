import { ThemedStyles } from 'Theme/types';

export const styles = {
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    height: '100%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  emptyCategory: {
    paddingTop: 80,
    alignItems: 'center',
  },
} satisfies ThemedStyles;
