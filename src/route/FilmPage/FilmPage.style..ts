import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    paddingInline: 16,
  },
  mainContent: { flexDirection: 'row', gap: 16, width: '100%' },
  poster: { width: '40%', aspectRatio: '166 / 250', borderRadius: 16 },
  mainInfo: {
    width: '55%',
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  originalTitle: { fontSize: 16, color: Colors.gray },
  playBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    color: Colors.white,
    fontSize: 16,
    marginBlockStart: 16,
  },
  description: { fontSize: 16, marginTop: 16 },
});
