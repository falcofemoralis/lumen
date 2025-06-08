import { Colors } from 'Style/Colors';
import { CONTENT_WRAPPER_PADDING } from 'Style/Layout';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  item: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 10,
  },
  itemContentWrapper: {
    paddingHorizontal: CONTENT_WRAPPER_PADDING,
  },
  itemBorder: {
    borderTopColor: Colors.border,
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
    borderRadius: 8,
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
    height: 40,
    width: 40,
    borderRadius: 50,
  },
});
