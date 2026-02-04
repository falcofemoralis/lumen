import { ThemedStyles } from 'Theme/types';

export const styles = {
  fullscreenLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    backgroundColor: 'transparent',
  },
} satisfies ThemedStyles;
