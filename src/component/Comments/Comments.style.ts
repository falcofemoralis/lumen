import Colors from 'Style/Colors';
import CreateStyles, { scale } from 'Util/CreateStyles';

export const INDENT_SIZE = scale(16);

export const styles = CreateStyles({
  commentsList: {
  },
  item: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
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
    flex: 1,
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 8,
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
    color: Colors.black,
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
  noComments: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  noCommentsText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
});
