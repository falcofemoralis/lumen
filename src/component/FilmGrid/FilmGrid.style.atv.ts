import { Theme, ThemedStyles } from 'Theme/types';

export const ROW_GAP = 16;

// Room below the last row for the bottom half of a focused card's zoom.
export const FOCUS_OVERFLOW_GAP = 32;

const HEADER_HEIGHT = 32;

export const componentStyles = ({ scale }: Theme) => ({
  grid: {
    flex: 1,
  },
  header: {
    width: '100%',
    paddingTop: scale(ROW_GAP),
    // Cards are inset by half a gap each side, so match that to line the title
    // up with the first column.
    paddingHorizontal: scale(ROW_GAP) / 2,
  },
  headerText: {
    fontSize: scale(HEADER_HEIGHT),
    lineHeight: scale(HEADER_HEIGHT),
    fontWeight: '700',
  },
  // The list content is as tall as its items, so an empty list has to be grown
  // to the grid's height before its empty component can be centered in it.
  centeredEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
} satisfies ThemedStyles);
