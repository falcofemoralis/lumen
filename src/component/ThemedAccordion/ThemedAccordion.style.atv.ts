import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    width: '100%',
  },
  groupContainer: {
    width: '100%',
  },
  group: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  groupFocused: {
    backgroundColor: Colors.backgroundFocused,
    color: Colors.textFocused,
  },
  content: {
    flexDirection: 'column',
  },
  overlay: {
    maxHeight: '70%',
    maxWidth: '50%',
  },
});
