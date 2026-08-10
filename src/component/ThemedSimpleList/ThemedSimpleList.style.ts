import { Theme, ThemedStyles } from 'Theme/types';

export const MAX_ITEMS_TO_DISPLAY = 6;
export const MAX_ITEMS_TO_DISPLAY_LANDSCAPE = 5;

export const ITEM_HEIGHT = 48;
export const HEADER_HEIGHT = 32;

// Share of the screen the items viewport may take before it caps below
// MAX_ITEMS_TO_DISPLAY. The rest is left to the header and to whatever chrome
// wraps the list (the overlay's padding, border and screen margins).
export const MAX_SCREEN_RATIO = 0.7;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  // Fixed height (single line, see `numberOfLines`) so the items viewport can be
  // sized against it without measuring.
  header: {
    height: scale(HEADER_HEIGHT),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
  },
  headerText: {
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
    lineHeight: scale(16),
    fontWeight: '500',
  },
  // `flexBasis: 'auto'` rather than `flex: 1`: the list is commonly the child of
  // a container sized by its own content (an overlay panel). A zero basis makes
  // that parent measure the list as nothing and collapse to its padding, leaving
  // the rows to spill out over the screen. An auto basis measures the rows, and
  // grow/shrink still fill or fit a parent that does have a height of its own.
  container: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
  },
  // Height is set by the component: an exact number of rows, so the viewport
  // never ends mid-item and never overflows what its container can show.
  items: {
    flexDirection: 'column',
  },
  item: {
    height: scale(ITEM_HEIGHT),
    borderRadius: scale(16),
    backgroundColor: colors.transparent,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    height: scale(ITEM_HEIGHT),
    justifyContent: 'flex-start',
    paddingHorizontal: scale(12),
  },
  itemText: {
    fontSize: scale(15),
  },
  listItemSelected: {
    backgroundColor: colors.primary,
  },
  icon: {
    marginRight: scale(5),
    height: scale(20),
    width: scale(20),
    backgroundColor: colors.transparent,
  },
} satisfies ThemedStyles);