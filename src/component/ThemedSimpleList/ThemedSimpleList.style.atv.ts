import { Theme, ThemedStyles } from 'Theme/types';

export const MAX_ITEMS_TO_DISPLAY = 6;
export const ITEM_HEIGHT = 48;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
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
  listContainer: {
    flexDirection: 'column',
    flex: 0,
  },
  listItemsWrapper: {
    flexDirection: 'column',
    maxHeight: MAX_ITEMS_TO_DISPLAY * scale(ITEM_HEIGHT) - scale(42),
    width: scale(300),
    overflow: 'hidden',
    paddingHorizontal: scale(12),
    marginHorizontal: scale(-12),
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    height: scale(ITEM_HEIGHT),
    borderRadius: scale(12),
  },
  itemFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(12),
  },
  itemSelected: {
    backgroundColor: colors.primary,
    borderRadius: scale(12),
  },
  itemContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  text: {
    color: colors.text,
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(20),
    fontWeight: '500',
    maxWidth: '90%',
  },
  textFocused: {
    color: colors.textFocused,
  },
  textSelected: {
    color: colors.textOnTertiary,
  },
  icon: {
    marginRight: scale(5),
    height: scale(20),
    width: scale(20),
    minWidth: scale(20),
  },
  iconFocused: {
  },
  iconSelected: {
  },
} satisfies ThemedStyles);