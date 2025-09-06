import { ITEM_HEIGHT, MAX_ITEMS_TO_DISPLAY } from 'Component/ThemedSimpleList/ThemedSimpleList.style.atv';
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
  container: {
  },
  contentContainer: {
    maxHeight: MAX_ITEMS_TO_DISPLAY * ITEM_HEIGHT - 16,
  },
});
