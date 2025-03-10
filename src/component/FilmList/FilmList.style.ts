import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 8;

export const styles = CreateStyles({
  gridRow: {
    flexDirection: 'row',
    width: '100%',
    gap: ROW_GAP,
    paddingBottom: ROW_GAP,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    paddingBottom: 4,
    marginBottom: 4,
  },
});
