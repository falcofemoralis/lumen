import Colors from 'Style/Colors';
import CreateStyles, { scale } from 'Util/CreateStyles';

export const ITEM_ELEMENTS_HEIGHT = scale(0) * 2;
export const INDENT_SIZE = scale(0);

export const ITEM_INTERNAL_GAP = scale(0);
export const ITEM_PADDING = scale(0);
export const BOTTOM_PADDING = scale(0);

export const ITEM_ADDITIONAL_HEIGHT = ITEM_ELEMENTS_HEIGHT
  + ITEM_PADDING * 2;
  // + BOTTOM_PADDING;

export const styles = CreateStyles({
  wrapper: {
    flexDirection: 'column',
    width: '100%',
  },
  commentsList: {
  },
  item: {
    flexDirection: 'row',
    // paddingBottom: BOTTOM_PADDING,
  },
  itemFocused: {
    backgroundColor: Colors.white,
  },
  itemEven: {
    // backgroundColor: Colors.darkGray,
  },
  avatar: {
    height: 32,
    width: 32,
    borderRadius: 64,
  },
  comment: {
    flexDirection: 'column',
    // paddingBlock: 8,
    borderWidth: 1,
    borderColor: Colors.secondary,
    // backgroundColor: Colors.darkGray,
    // borderRadius: 12,
    // padding: ITEM_PADDING,
  },
  commentTextWrapper: {
    width: '100%',
    flexDirection: 'column',
  },
  commentText: {
    fontSize: 16,
    lineHeight: 16,
  },
  commentTextFocused: {
    color: Colors.black,
  },
  spoiler: {
    backgroundColor: Colors.gray,
    color: Colors.gray,
  },
  textFocused: {
    color: Colors.black,
  },
  loader: {
    alignSelf: 'center',
    height: '100%',
    width: '100%',
  },
  measureText: {
    opacity: 0,
    position: 'absolute',
    alignSelf: 'baseline',
  },
});
