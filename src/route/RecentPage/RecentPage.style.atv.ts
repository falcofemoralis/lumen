import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 24;

export const styles = CreateStyles({
  grid: {
    padding: ROW_GAP,
  },
  rowStyle: {
    gap: ROW_GAP,
  },
  item: {
    height: 'auto',
    flexDirection: 'row',
    gap: 8,
  },
  itemFocused: {
    backgroundColor: Colors.white,
  },
  poster: {
    height: 150,
    width: 'auto',
    aspectRatio: '166 / 250',
  },
  itemContent: {
    height: '100%',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  nameFocused: {
    color: Colors.black,
  },
  date: {
  },
  dateFocused: {
    color: Colors.black,
  },
  info: {
  },
  infoFocused: {
    color: Colors.black,
  },
  additionalInfo: {
  },
  additionalInfoFocused: {
    color: Colors.black,
  },
});
