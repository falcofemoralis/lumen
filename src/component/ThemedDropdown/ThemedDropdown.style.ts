import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  input: {
    backgroundColor: Colors.gray,
    justifyContent: 'flex-start',
    gap: 4,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderBottomColor: Colors.gray,
    borderBottomWidth: 1,
  },
  listHeaderText: {
    color: Colors.lightGray,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '500',
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
