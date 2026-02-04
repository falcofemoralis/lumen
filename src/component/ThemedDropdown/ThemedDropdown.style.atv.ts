import { ITEM_HEIGHT, MAX_ITEMS_TO_DISPLAY } from 'Component/ThemedSimpleList/ThemedSimpleList.style.atv';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  input: {
    borderRadius: scale(12),
  },
  inputFocused: {
  },
  inputText: {
  },
  inputTextFocused: {
  },
  inputImage: {
    height: scale(20),
    width: scale(20),
    alignSelf: 'center',
  },
  container: {
  },
  contentContainer: {
    maxHeight: MAX_ITEMS_TO_DISPLAY * scale(ITEM_HEIGHT) - scale(16),
  },
} satisfies ThemedStyles);
