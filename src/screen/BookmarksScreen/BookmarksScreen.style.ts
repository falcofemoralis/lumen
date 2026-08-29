import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(16),
  },
  content: {
    height: '100%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },
  manageButton: {
    width: scale(42),
    height: scale(42),
  },
  manageButtonContent: {
    padding: 0,
  },
  emptyCategory: {
    alignItems: 'center',
  },
} satisfies ThemedStyles);
