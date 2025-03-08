import CreateStyles, { scale } from 'Util/CreateStyles';

export const ROW_GAP = 16;

export const HEADER_HEIGHT = scale(40);

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
    fontSize: 32,
    fontWeight: '700',
    paddingBottom: 8,
    marginBottom: 8,
  },
});
