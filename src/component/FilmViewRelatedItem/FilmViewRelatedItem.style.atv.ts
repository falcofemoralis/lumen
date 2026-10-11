import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  relatedItem: { width: scale(100) },
  relatedItemContent: { flex: 0, alignItems: 'stretch' },
  relatedListItem: {
    flex: 0,
    width: scale(100),
  },
} satisfies ThemedStyles);
