import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  input: {
    borderRadius: 12,
  },
  inputFocused: {
  },
  inputText: {
  },
  inputTextFocused: {
  },
  inputImage: {
    height: 20,
    width: 20,
    alignSelf: 'center',
  },
  icon: {
    marginRight: 5,
    height: 20,
    width: 20,
  },
  iconFocused: {
  },
  container: {
    maxHeight: 300,
    padding: 8,
  },
  listContainer: {
    maxHeight: 300,
    padding: 8,
    alignSelf: 'flex-end',
  },
  contentContainer: {
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomColor: Colors.gray,
    borderBottomWidth: 1,
  },
  headerText: {
    color: Colors.lightGray,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  itemContainer: {
    flexDirection: 'row',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBlock: 5,
    borderRadius: 12,
  },
  itemFocused: {
    backgroundColor: Colors.white,
  },
  itemSelected: {
    backgroundColor: Colors.primary,
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  textFocused: {
    color: Colors.black,
  },
  textSelected: {
    color: Colors.lightBlue,
  },
  iconSelected: {
  },
});
