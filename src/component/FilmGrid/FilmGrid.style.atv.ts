import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 16;

export const styles = CreateStyles({
  grid: {
    paddingTop: ROW_GAP,
    paddingHorizontal: ROW_GAP,
  },
  rowStyle: {
    flexDirection: 'row',
    width: '100%',
    gap: ROW_GAP,
  },
});
