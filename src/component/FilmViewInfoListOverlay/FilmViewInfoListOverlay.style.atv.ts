import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  infoListAccordionOverlay: {
    flex: 0,
  },
  infoListGroup: {
    borderRadius: scale(12),
  },
} satisfies ThemedStyles);
