import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  input: {
    backgroundColor: Colors.gray,
    borderRadius: 8,
    padding: 12,
  },
  inputText: {
    fontSize: 16,
    color: Colors.white,
    flex: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  content: {
    backgroundColor: Colors.background,
    borderWidth: 0,
  },
  item: {
    padding: 16,
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
  listItem: {
  },
  listItemSelected: {
    backgroundColor: Colors.primary,
  },
});
