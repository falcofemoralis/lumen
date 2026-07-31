import { Theme, ThemedStyles } from 'Theme/types';

export const MAX_ITEMS_TO_DISPLAY = 5;
export const ITEM_HEIGHT = 48;
export const HEADER_HEIGHT = 30;

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    height: scale(ITEM_HEIGHT),
    borderRadius: scale(12),
  },
  itemFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(12),
  },
  itemSelected: {
    backgroundColor: colors.primary,
    borderRadius: scale(12),
  },
  itemContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  text: {
    color: colors.text,
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(20),
    fontWeight: '500',
    maxWidth: '90%',
  },
  textFocused: {
    color: colors.textFocused,
  },
  textSelected: {
    color: colors.textOnTertiary,
  },
  icon: {
    marginRight: scale(5),
    height: scale(20),
    width: scale(20),
    minWidth: scale(20),
    backgroundColor: colors.transparent,
  },
  iconFocused: {
  },
  iconSelected: {
  },
} satisfies ThemedStyles);