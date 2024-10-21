import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    backgroundColor: '#555555aa',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '95%',
    height: 4,
    marginTop: 40,
    marginBottom: 20,
  },
  progressBar: {
    backgroundColor: 'yellow',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    bottom: 0,
    left: 0,
  },
  playableBar: {
    backgroundColor: '#888888aa',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  thumb: {
    zIndex: 3,
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: 'yellow',
    position: 'absolute',
    top: '-80%',
    right: 0,
  },
  focusedThumb: {
    backgroundColor: 'green',
  },
});
