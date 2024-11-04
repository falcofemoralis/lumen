import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
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
  lastItem: {
    marginRight: 0,
  },
});
