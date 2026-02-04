import { Theme, ThemedStyles } from 'Theme/types';

const MAX_ITEMS_TO_DISPLAY = 6;
const MAX_ITEMS_TO_DISPLAY_LANDSCAPE = 5;
const ITEM_HEIGHT = 48;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  item: {
    paddingHorizontal: scale(16),
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  itemLabel: {
    flex: 1,
    fontSize: scale(text.sm.fontSize),
    color: colors.text,
  },
  icon: {
    marginRight: scale(5),
    height: scale(20),
    width: scale(20),
  },
  listContainer: {
    flexDirection: 'column',
  },
  listHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(8),
    marginBottom: scale(8),
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
  },
  listHeaderText: {
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
    lineHeight: scale(16),
    fontWeight: '500',
  },
  listItems: {
    flexDirection: 'column',
    maxHeight: MAX_ITEMS_TO_DISPLAY * scale(ITEM_HEIGHT) - scale(8),
  },
  listItemsLandscape: {
    maxHeight: MAX_ITEMS_TO_DISPLAY_LANDSCAPE * scale(ITEM_HEIGHT) - scale(8),
  },
  listItem: {
    borderRadius: scale(16),
    flex: 1,
  },
  listItemContent: {
  },
  listItemSelected: {
    backgroundColor: colors.primary,
  },
  emptyBlock: {
    minHeight: scale(120),
    justifyContent: 'center',
    alignItems: 'center',
  },
} satisfies ThemedStyles);