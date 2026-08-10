import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  infoListAccordionOverlay: {
    flex: 0,
  },
  infoListGroup: {
    marginBottom: scale(8),
    paddingInline: scale(16),
    borderRadius: scale(12),
    backgroundColor: colors.backgroundLight,
  },
} satisfies ThemedStyles);
