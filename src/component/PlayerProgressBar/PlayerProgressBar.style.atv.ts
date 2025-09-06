import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  progressBarContainer: {
    position: 'relative',
  },
  progressBar: {
    marginBlock: 12,
  },
  thumb: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: Colors.white,
  },
  focusedThumb: {
    width: 12,
    height: 12,
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
