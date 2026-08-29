import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = (_theme: Theme) => ({
  scheduleOverlay: {
    width: '50%',
  },
  scheduleOverlayContent: {
    flexDirection: 'row',
  },
  scheduleAccordionOverlay: {
    flexGrow: 1,
  },
} satisfies ThemedStyles);
