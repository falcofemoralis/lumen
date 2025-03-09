import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 16;

export const HEADER_HEIGHT = 32;

export const styles = CreateStyles({
  container: {
  },
  grid: {
  },
  gridItem: {
    flexDirection: 'row',
    gap: ROW_GAP,
    paddingBlock: ROW_GAP,
  },
  rowStyle: {
  },
  headerText: {
    fontSize: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT,
    fontWeight: '700',
  },
});
