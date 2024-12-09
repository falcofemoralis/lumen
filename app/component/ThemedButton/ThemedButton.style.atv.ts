import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    backgroundColor: '#444746',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 44,
  },
  text: {
    color: '#E3E3E3',
  },
  containerFocused: {
    backgroundColor: '#E3E3E3',
  },
  containerSelected: {
    backgroundColor: Colors.secondary,
  },
  textFocused: {
    color: '#303030',
  },
});
