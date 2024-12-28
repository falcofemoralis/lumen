import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'relative',
    height: 'auto',
    width: '100%',
  },
  video: {
    height: '100%',
    width: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    backgroundColor: Colors.transparent,
    height: 225,
    left: 0,
    top: 0,
    width: '100%',
    padding: 15,
    zIndex: 10,
  },
  controls: {},
  playControl: {
    backgroundColor: 'red',
    left: '50%',
    position: 'absolute',
    top: '50%',
  },
  progressBarContainer: {
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
