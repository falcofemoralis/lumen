import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
  },
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scale(28),
    fontWeight: '700',
  },
} satisfies ThemedStyles);
