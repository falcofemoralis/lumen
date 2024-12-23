import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'relative',
    marginTop: 40,
    height: 4,
    width: '100%',
    backgroundColor: '#555555aa',
  },
  progressBar: {
    position: 'absolute',
    zIndex: 5,
    height: 4,
    top: 0,
    bottom: 0,
    left: 0,
    marginLeft: -10,
    padding: 0,
    width: '100%',
  },
  playableBar: {
    position: 'absolute',
    zIndex: 0,
    top: 0,
    bottom: 0,
    left: 0,
    height: 4,
    width: '100%',
    backgroundColor: '#FF0000',
  },
});
