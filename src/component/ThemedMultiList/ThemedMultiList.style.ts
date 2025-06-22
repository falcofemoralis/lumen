import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

const MAX_ITEMS_TO_DISPLAY = 6;
const MAX_ITEMS_TO_DISPLAY_LANDSCAPE = 5;
const ITEM_HEIGHT = 48;

export const styles = CreateStyles({
  item: {
    paddingHorizontal: 12,
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
  },
  icon: {
    marginRight: 5,
    height: 20,
    width: 20,
  },
  listContainer: {
    flexDirection: 'column',
  },
  listHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
  },
  listHeaderText: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '500',
  },
  listItems: {
    flexDirection: 'column',
    maxHeight: MAX_ITEMS_TO_DISPLAY * ITEM_HEIGHT - 8,
  },
  listItemsLandscape: {
    maxHeight: MAX_ITEMS_TO_DISPLAY_LANDSCAPE * ITEM_HEIGHT - 8,
  },
  listItem: {
    borderRadius: 16,
    flex: 1,
  },
  listItemContent: {
  },
  listItemSelected: {
    backgroundColor: Colors.primary,
  },
});
