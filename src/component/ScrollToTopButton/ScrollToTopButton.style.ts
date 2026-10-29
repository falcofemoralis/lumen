import { Theme, ThemedStyles } from 'Theme/types';

import { BUTTON_SIZE } from './ScrollToTopButton.config';

export const componentStyles = ({ scale, colors }: Theme) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: scale(BUTTON_SIZE),
    height: scale(BUTTON_SIZE),
    borderRadius: scale(BUTTON_SIZE) / 2,
    backgroundColor: colors.transparent,
    borderWidth: scale(2),
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Sits above the grid's cards and any per-card action buttons.
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    shadowOffset: { width: 0, height: scale(2) },
  },
} satisfies ThemedStyles);