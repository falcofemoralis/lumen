import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'relative',
    backgroundColor: Colors.background,
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  background: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: '50%',
    width: '100%',
    zIndex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 48,
    paddingBottom: 32,
    backgroundColor: 'transparent',
    width: '100%',
    height: 'auto',
    zIndex: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 14,
    opacity: 1,
  },
  controlsRowHidden: {
    opacity: 0,
  },
  progressBarContainer: {
    backgroundColor: '#555555aa',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    height: 4,
    marginTop: 16,
    marginBottom: 16,
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
  progressBar: {
    backgroundColor: Colors.secondary,
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    bottom: 0,
    left: 0,
  },
  thumbContainer: {
    zIndex: 3,
    width: 10,
    height: 10,
    position: 'absolute',
    top: '-80%',
    right: 0,
  },
  thumb: {
    height: '100%',
    width: '100%',
    borderRadius: 99,
    backgroundColor: Colors.white,
  },
  focusedThumb: {
    backgroundColor: Colors.secondary,
  },
  topInfo: {
  },
  title: {
    fontSize: 36,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  bottomActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    width: 'auto',
  },
  durationText: {
    fontSize: 16,
    textAlign: 'right',
  },
  action: {
    padding: 8,
    borderRadius: 50,
  },
  focusedAction: {
    backgroundColor: Colors.whiteTransparent,
  },
});
