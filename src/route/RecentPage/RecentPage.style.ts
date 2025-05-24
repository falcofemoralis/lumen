import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  item: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 10,
  },
  itemBorder: {
    borderTopColor: Colors.lightGravel,
    borderTopWidth: 1,
  },
  itemContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  poster: {
    height: 100,
    width: 'auto',
    aspectRatio: '166 / 250',
  },
  itemContent: {
    flexDirection: 'column',
    flex: 1,
    gap: 6,
  },
  name: {
    fontWeight: 'bold',
  },
  date: {
  },
  info: {
  },
  additionalInfo: {
  },
  deleteButton: {
  },
});
