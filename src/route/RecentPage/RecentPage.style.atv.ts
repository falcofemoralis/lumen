import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 24;

export const styles = CreateStyles({
  grid: {
    padding: ROW_GAP,
    marginLeft: ROW_GAP,
    marginRight: ROW_GAP,
  },
  rowStyle: {
    gap: ROW_GAP,
  },
  item: {
    height: 'auto',
    flexDirection: 'row',
    gap: 8,
    opacity: 0.7,
  },
  itemFocused: {
    opacity: 1,
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
  },
  date: {
  },
  dateFocused: {
  },
  info: {
  },
  infoFocused: {
  },
  additionalInfo: {
  },
  additionalInfoFocused: {
  },
});
