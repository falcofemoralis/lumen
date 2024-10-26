import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'relative',
    backgroundColor: 'red',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
    width: '100%',
    height: 225,
  },
  action: {
    color: 'red',
    fontSize: 24,
    padding: 12,
  },
});
