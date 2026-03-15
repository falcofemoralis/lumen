import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text }: Theme) => ({
  overlay: {
    width: scale(300),
    height: scale(300),
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
} satisfies ThemedStyles);
