import Colors from 'Style/Colors';
import CreateStyles, { scale } from 'Util/CreateStyles';

export const ITEM_ELEMENTS_HEIGHT = scale(20) * 2;
export const INDENT_SIZE = scale(16);

export const ITEM_PADDING = scale(8);
export const BOTTOM_PADDING = scale(16);

export const ITEM_ADDITIONAL_HEIGHT = ITEM_ELEMENTS_HEIGHT
  + ITEM_PADDING * 2
  + BOTTOM_PADDING;

export const styles = CreateStyles({
  wrapper: {
    flexDirection: 'column',
    width: '100%',
  },
  commentsList: {
  },
  item: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: BOTTOM_PADDING,
  },
  itemFocused: {
    backgroundColor: Colors.gray,
  },
  itemEven: {
  },
  avatar: {
    height: 32,
    width: 32,
    borderRadius: 64,
  },
  comment: {
    flexDirection: 'column',
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: ITEM_PADDING,
  },
  commentTextWrapper: {
    width: '100%',
    flexDirection: 'column',
    marginBlock: 4,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 16,
  },
  commentTextSmall: {
    fontSize: 13,
    color: Colors.lightGray,
  },
  commentTextFocused: {
  },
  commentDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'baseline',
    width: '100%',
  },
  commentLikes: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  spoiler: {
    backgroundColor: Colors.gray,
    color: Colors.gray,
  },
  textFocused: {
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
  noComments: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  noCommentsText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
});
