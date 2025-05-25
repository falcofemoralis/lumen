import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
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
  storyBoard: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    opacity: 0,
  },
  storyBoardVisible: {
    opacity: 1,
  },
});
