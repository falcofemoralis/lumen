import { ThemedStyles } from 'Theme/types';

export const styles = {
  // Centered by filling the parent, NOT by offsetting itself 50% and pulling
  // back with a percentage transform: those offsets resolve against the parent's
  // height, and a parent that is sized by its own content (an overlay panel with
  // nothing but a maxHeight) has none to resolve against -- the loader ends up
  // laid out at the top-left corner, behind or outside the content.
  // Non-interactive: it now covers the whole parent while it spins.
  fullscreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  backdrop: {

  },
} satisfies ThemedStyles;
