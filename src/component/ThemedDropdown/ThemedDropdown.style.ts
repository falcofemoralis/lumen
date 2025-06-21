import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

const MAX_ITEMS_TO_DISPLAY = 6;
const ITEM_HEIGHT = 48;

export const styles = CreateStyles({
  input: {
    backgroundColor: Colors.backgroundLighter,
  },
  inputContent: {
    justifyContent: 'flex-start',
    gap: 8,
    padding: 8,
  },
  inputIcon: {
  },
  inputText: {
  },
  inputImage: {
    height: 20,
    width: 20,
    alignSelf: 'center',
  },
  overlay: {
    padding: 8,
  },
  overlayContent: {
  },
  item: {
    paddingHorizontal: 12,
    height: ITEM_HEIGHT,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
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
    flexDirection: 'row',
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
  listItem: {
    borderRadius: 16,
  },
  listItemContent: {
  },
  listItemSelected: {
    backgroundColor: Colors.primary,
  },
});
