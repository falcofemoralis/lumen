import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ colors }: Theme) => ({
  container: {
    backgroundColor: colors.thumbnail,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
} satisfies ThemedStyles);