import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  input: {
    backgroundColor: Colors.input,
    borderRadius: 16,
    paddingHorizontal: 8,
    color: Colors.text,
    fontSize: 16,
  },
  inputFocus: {
    backgroundColor: Colors.inputFocused,
    color: Colors.textFocused,
  },
});
