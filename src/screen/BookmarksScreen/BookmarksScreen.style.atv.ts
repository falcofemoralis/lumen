import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
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
    paddingHorizontal: scale(32),
    paddingBottom: scale(8),
    marginTop: scale(12),
  },
  emptyCategory: {
    alignItems: 'center',
  },
} satisfies ThemedStyles);
