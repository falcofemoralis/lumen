import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.button,
    borderRadius: 8,
    color: Colors.text,
    fontSize: 16,
  },
  content: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 16,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
  rightIcon: {
  },
  disabled: {
    opacity: 0.5,
  },
});
