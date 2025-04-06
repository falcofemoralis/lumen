import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 16;

export const HEADER_HEIGHT = 32;

export const styles = CreateStyles({
  container: {
    width: '100%',
  },
  grid: {
    width: '100%',
  },
  rowStyle: {
    flexDirection: 'row',
    width: '100%',
    gap: ROW_GAP,
    paddingBlock: ROW_GAP,
    paddingHorizontal: ROW_GAP,
  },
  headerText: {
    fontSize: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT,
    fontWeight: '700',
  },
});
