import { Theme, ThemedStyles } from 'Theme/types';

const MAX_ITEMS_TO_DISPLAY = 6;
const MAX_ITEMS_TO_DISPLAY_LANDSCAPE = 5;

export const ITEM_HEIGHT = 48;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  item: {
    paddingHorizontal: scale(12),
    height: scale(ITEM_HEIGHT),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(8),
    marginBottom: scale(8),
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
  },
  headerText: {
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
    lineHeight: scale(16),
    fontWeight: '500',
  },
  listContainer: {
    flexDirection: 'column',
    flex: 1,
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
  },
  listItemContent: {
    flex: 1,
  },
  listItemSelected: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);