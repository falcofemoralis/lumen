import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  relatedItem: {
    width: scale(100),
  },
} satisfies ThemedStyles);
