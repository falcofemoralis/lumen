import { Theme, ThemedStyles } from 'Theme/types';

// The list draws the field into a slot of a fixed height, so it needs one of its
// own -- a TextInput sizes itself to its font and padding otherwise, and would
// grow straight out of that slot.
export const SEARCH_INPUT_HEIGHT = 44;

export const componentStyles = ({ scale }: Theme) => ({
  searchInput: {
    height: scale(SEARCH_INPUT_HEIGHT),
  },
  overlay: {
    padding: scale(8),
  },
  overlayContent: {
    width: '100%',
    flexDirection: 'row',
    maxHeight: '100%',
  },
} satisfies ThemedStyles);
