import { Theme, ThemedStyles } from 'Theme/types';

import { BUTTON_MARGIN, BUTTON_SIZE_TV } from './ScrollToTopButton.config';

export const componentStyles = ({ scale, colors }: Theme) => ({
  container: {
    position: 'absolute',
    width: scale(BUTTON_SIZE_TV),
    height: scale(BUTTON_SIZE_TV),
    borderRadius: scale(BUTTON_SIZE_TV) / 2,
    backgroundColor: colors.transparent,
    borderWidth: scale(2),
    borderColor: colors.primary,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  'top-left': {
    top: scale(BUTTON_MARGIN),
    left: scale(BUTTON_MARGIN),
  },
  'top-right': {
    top: scale(BUTTON_MARGIN),
    right: scale(BUTTON_MARGIN),
  },
  'bottom-left': {
    bottom: scale(BUTTON_MARGIN),
    left: scale(BUTTON_MARGIN),
  },
  'bottom-right': {
    bottom: scale(BUTTON_MARGIN),
    right: scale(BUTTON_MARGIN),
  },
  focused: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);