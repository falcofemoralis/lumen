import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    paddingBlockStart: 32,
  },
  poster: {
    width: '30%',
    aspectRatio: '166 / 250',
    borderRadius: 16,
  },
  mainInfo: {
    width: '65%',
    backgroundColor: Colors.lightBackground,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  originalTitle: {
    fontSize: 16,
    color: Colors.lightGray,
  },
});
