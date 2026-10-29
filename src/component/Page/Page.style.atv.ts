import {
  NAVIGATION_BAR_TV_WIDTH,
  NAVIGATION_BAR_TV_WIDTH_OPENED,
} from 'Component/NavigationBar/NavigationBar.style.atv';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, dimensions, colors }: Theme) => ({
  container: {
    height: '100%',
    flex: 1,
  },
  containerOpened: {
    flex: 1,
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