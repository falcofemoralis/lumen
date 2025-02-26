import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  list: {
  },
  item: {
    flexDirection: 'row',
  },
  itemEven: {
    backgroundColor: Colors.darkGray,
  },
  avatar: {
    height: 40,
    width: 40,
  },
  comment: {
    flexDirection: 'column',
    paddingBlock: 8,
  },
  commentText: {
    padding: 8,
    flex: 1,
    width: '90%',
  },
  spoiler: {
    backgroundColor: Colors.gray,
    padding: 2,
    borderRadius: 8,
    color: Colors.white,
  },
});
