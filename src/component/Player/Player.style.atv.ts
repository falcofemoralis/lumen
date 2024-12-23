import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'relative',
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 36,
    paddingBottom: 36,
    backgroundColor: 'transparent',
    width: '100%',
    height: 'auto',
    opacity: 0,
  },
  controlsVisible: {
    opacity: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 36,
  },
  action: {
    color: 'red',
    fontSize: 24,
    padding: 12,
  },
  invisibleContainer: {
    height: 16,
    position: 'absolute',
    top: -10,
    left: 10,
    right: 10,
    zIndex: 5,
  },
});
