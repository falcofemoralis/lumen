import { Theme, ThemedStyles } from 'Theme/types';

export const MAX_ITEMS_TO_DISPLAY = 5;
export const ITEM_HEIGHT = 48;
export const HEADER_HEIGHT = 30;
export const SEARCH_HEIGHT = 64;

// Share of the screen the items viewport may take before it caps below
// MAX_ITEMS_TO_DISPLAY. The rest is left to the header and to whatever chrome
// wraps the list (the overlay's padding, border and screen margins).
export const MAX_SCREEN_RATIO = 0.7;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  // Fixed height (single line, see `numberOfLines`) so the items viewport can be
  // sized against it without measuring.
  header: {
    height: scale(HEADER_HEIGHT),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: scale(10),
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
  },
  headerText: {
    color: colors.textSecondary,
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(16),
    fontWeight: '500',
  },
  listContainer: {
    flexDirection: 'column',
    flex: 0,
  },
  // Fixed height for the same reason as the header: the items viewport is sized
  // against it, so whatever the caller puts here must not change the layout.
  search: {
    height: scale(SEARCH_HEIGHT),
    justifyContent: 'center',
    paddingVertical: scale(8),
  },
  // Height is set by the component: an exact number of rows, so the viewport
  // never ends mid-item and never overflows what the overlay can show.
  listItemsWrapper: {
    flexDirection: 'column',
    width: scale(300),
    overflow: 'hidden',
    paddingHorizontal: scale(12),
    marginHorizontal: scale(-12),
  },
  item: {
    height: scale(ITEM_HEIGHT),
    borderRadius: scale(12),
    backgroundColor: colors.transparent,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    height: scale(ITEM_HEIGHT),
    justifyContent: 'flex-start',
    paddingHorizontal: scale(10),
  },
  itemText: {
    fontSize: scale(text.xs.fontSize),
  },
  icon: {
    marginRight: scale(5),
    height: scale(20),
    width: scale(20),
    minWidth: scale(20),
    backgroundColor: colors.transparent,
  },
} satisfies ThemedStyles);