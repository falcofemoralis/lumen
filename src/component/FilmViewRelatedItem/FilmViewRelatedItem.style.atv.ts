import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  relatedListItem: {
    flex: 0,
    width: scale(100),
  },
} satisfies ThemedStyles);
