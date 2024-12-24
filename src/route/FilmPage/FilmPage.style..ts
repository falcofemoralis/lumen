import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    paddingInline: 16,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  poster: {
    width: '40%',
    aspectRatio: '166 / 250',
    borderRadius: 16,
  },
  mainInfo: {
    width: '55%',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  originalTitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  releaseDate: {

  },
  mainInfoRow: {
    flexDirection: 'column',
  },
  mainInfoItem: {
    width: '100%',
  },
  playBtn: {
    width: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    color: Colors.white,
    fontSize: 16,
    marginBlockStart: 16,
  },
  description: {
    color: Colors.lightGray,
    fontSize: 16,
    marginTop: 16,
  },
});
