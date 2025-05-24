import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
  },
  group: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  groupFocused: {
    backgroundColor: Colors.white,
    color: Colors.black,
  },
  content: {
    flexDirection: 'column',
  },
  overlay: {
    maxHeight: '60%',
  },
});
