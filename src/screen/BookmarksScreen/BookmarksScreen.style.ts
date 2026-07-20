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
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  manageButton: {
    width: 44,
    height: 44,
  },
  manageButtonContent: {
    padding: 0,
  },
  emptyCategory: {
    paddingTop: 120,
    alignItems: 'center',
  },
} satisfies ThemedStyles;
