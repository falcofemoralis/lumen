import { Theme, ThemedStyles } from 'Theme/types';

const MAX_ITEMS_TO_DISPLAY = 6;
const ITEM_HEIGHT = 48;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
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
  icon: {
    marginRight: scale(5),
    height: scale(20),
    width: scale(20),
  },
  iconFocused: {
  },
  container: {
  },
  listContainer: {
    maxHeight: MAX_ITEMS_TO_DISPLAY * scale(ITEM_HEIGHT) - scale(16),
    alignSelf: 'flex-end',
    height: '100%',
  },
  contentContainer: {
  },
  scrollViewContainer: {
    overflow: 'hidden',
    flex: 1,
    flexDirection: 'column',
    minWidth: scale(300),
    paddingHorizontal: scale(12),
    marginHorizontal: scale(-12),
  },
  scrollView: {
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: scale(10),
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
  },
  headerText: {
    color: colors.textSecondary,
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(16),
    fontWeight: '500',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    height: scale(ITEM_HEIGHT),
    width: '100%',
    borderRadius: scale(12),
  },
  itemFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(12),
  },
  itemContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  text: {
    color: colors.text,
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(20),
    fontWeight: '500',
  },
  textFocused: {
    color: colors.textFocused,
  },
  textSelected: {
    color: colors.textOnTertiary,
  },
  iconSelected: {
  },
  emptyBlock: {
    justifyContent: 'center',
    flex: 1,
  },
} satisfies ThemedStyles);