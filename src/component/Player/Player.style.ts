import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'relative',
    backgroundColor: 'red',
    height: 'auto',
    width: '100%',
  },
  video: {
    height: 225,
    width: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    backgroundColor: 'transparent',
    height: 225,
    left: 0,
    top: 0,
    width: '100%',
    padding: 15,
  },
  controls: {},
  playControl: {
    backgroundColor: 'red',
    left: '50%',
    position: 'absolute',
    top: '50%',
  },
});
