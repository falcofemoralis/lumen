import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'absolute',
    left: '50%',
    bottom: 25,
    width: '70%',
    transform: [{ translateX: '-50%' }],
  },
  text: {
    fontSize: 25,
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 25,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
});
