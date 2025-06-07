import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  item: {
    paddingHorizontal: 12,
    height: 48,
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
    flexGrow: 0,
  },
  listHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
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
    marginTop: 8,
    flexGrow: 0,
    flexDirection: 'column',
  },
  listItem: {
    borderRadius: 16,
  },
  listItemSelected: {
    backgroundColor: Colors.primary,
  },
});
