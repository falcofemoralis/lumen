import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, dimensions, spacing, colors }: Theme) => ({
  container: {
    height: '100%',
    width: dimensions.width - scale(NAVIGATION_BAR_TV_WIDTH),
  },
  fullscreen: {
    height: '100%',
    width: '100%',
    marginInline: 0,
    marginTop: 0,
  },
  noConnectionContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: scale(16),
  },
} satisfies ThemedStyles);