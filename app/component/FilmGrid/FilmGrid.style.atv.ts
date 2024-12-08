import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  rowStyle: {
    gap: 15,
    flex: 1,
  },
  rows: {
    flex: 1,
    flexDirection: 'column',
    gap: 20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  item: {
    height: 'auto',
    flex: 1,
    marginRight: 20,
  },
  itemFocused: {
    borderWidth: 2,
    borderColor: 'blue',
  },
  lastItem: {
    marginRight: 0,
  },
});
