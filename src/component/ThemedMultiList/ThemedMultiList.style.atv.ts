import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

const MAX_ITEMS_TO_DISPLAY = 6;
const ITEM_HEIGHT = 48;

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
  },
  listContainer: {
    maxHeight: MAX_ITEMS_TO_DISPLAY * ITEM_HEIGHT - 16,
    alignSelf: 'flex-end',
    height: '100%',
  },
  contentContainer: {
  },
  scrollViewContainer: {
    overflow: 'hidden',
    flex: 1,
    flexDirection: 'column',
    minWidth: 300,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  scrollView: {
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
  },
  headerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '500',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: ITEM_HEIGHT,
    width: '100%',
    borderRadius: 12,
  },
  itemFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  textFocused: {
    color: Colors.textFocused,
  },
  textSelected: {
    color: Colors.textOnPrimary,
  },
  iconSelected: {
  },
  emptyBlock: {
    justifyContent: 'center',
    flex: 1,
  },
});
