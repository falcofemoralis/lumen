import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 8;

export const styles = CreateStyles({
  grid: {
    width: '100%',
    height: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    width: '100%',
    gap: ROW_GAP,
    paddingBottom: ROW_GAP,
  },
});
