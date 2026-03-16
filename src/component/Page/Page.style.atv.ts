import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, dimensions, spacing, colors }: Theme) => ({
  container: {
    height: '100%',
    width: dimensions.width - scale(NAVIGATION_BAR_TV_WIDTH) - scale(spacing.wrapperPaddingTV) * 2,
    marginInline: scale(spacing.wrapperPaddingTV),
  },
  content: {
    height: '100%',
    width: '100%',
  },
  fullscreen: {
    height: '100%',
    width: '100%',
    marginInline: 0,
    marginTop: 0,
  },
  noConnectionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    marginTop: scale(16),
  },
} satisfies ThemedStyles);