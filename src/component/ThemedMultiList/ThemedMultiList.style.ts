import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    maxHeight: 300,
    padding: 8,
  },
  contentContainer: {
  },
  item: {
    padding: 14,
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
  },
  listHeader: {
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomColor: Colors.gray,
    borderBottomWidth: 1,
    paddingTop: 12,
  },
  listHeaderText: {
    alignSelf: 'center',
    color: Colors.lightGray,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '500',
    marginBlock: 12,
  },
  listItems: {
    marginTop: 8,
  },
  listItem: {
    borderRadius: 16,
  },
  listItemSelected: {
    backgroundColor: Colors.primary,
  },
});
