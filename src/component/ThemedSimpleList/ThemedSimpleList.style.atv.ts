import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const MAX_ITEMS_TO_DISPLAY = 6;
export const ITEM_HEIGHT = 48;

export const styles = CreateStyles({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
  },
  headerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '500',
  },
  listContainer: {
    flexDirection: 'column',
    flex: 0,
  },
  listItemsWrapper: {
    flexDirection: 'column',
    maxHeight: MAX_ITEMS_TO_DISPLAY * ITEM_HEIGHT - 42,
    width: 300,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: ITEM_HEIGHT,
    borderRadius: 12,
  },
  itemFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 12,
  },
  itemSelected: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    maxWidth: '90%',
  },
  textFocused: {
    color: Colors.textFocused,
  },
  textSelected: {
    color: Colors.textOnPrimary,
  },
  icon: {
    marginRight: 5,
    height: 20,
    width: 20,
    minWidth: 20,
  },
  iconFocused: {
  },
  iconSelected: {
  },
});