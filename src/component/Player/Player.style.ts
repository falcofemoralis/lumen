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
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  controls: {
    height: '100%',
    width: '100%',
  },
  topActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  middleActions: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    flexDirection: 'row',
    gap: 80,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 16,
  },
  control: {
    alignSelf: 'center',
  },
  controlIcon: {
    backgroundColor: Colors.modal,
    padding: 10,
    borderRadius: 50,
  },
  durationRow: {
    marginBottom: 16,
  },
  progressBarRow: {
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  progressBarContainer: {
    position: 'relative',
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
    margin: 0,
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
    backgroundColor: '#888888aa',
  },
});
