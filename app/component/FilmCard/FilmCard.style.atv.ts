import CreateStyles from 'Util/CreateStyles';

export const CARD_HEIGHT_TV = 250;

export const styles = CreateStyles({
  card: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: CARD_HEIGHT_TV,
    borderWidth: 2,
    borderColor: 'green',
  },
  poster: {
    height: CARD_HEIGHT_TV - 30,
    width: '100%',
    aspectRatio: 83 / 125,
  },
  title: {
    width: '100%',
    height: 30,
    backgroundColor: 'red',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
