import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    padding: 16,
  },
  selectedTextStyle: {
    color: Colors.white,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
    height: 20,
    width: 20,
  },
});
