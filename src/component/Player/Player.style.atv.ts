import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.black,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  background: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: '60%',
    width: '100%',
    zIndex: 1,
    backgroundColor: Colors.transparent,
    opacity: 1,
  },
  backgroundGradient: {
    height: '100%',
    width: '100%',
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
    opacity: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 14,
    opacity: 1,
  },
  controlsRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlsRowHidden: {
    opacity: 0,
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
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    width: 46,
  },
  focusedAction: {
    borderRadius: 50,
    backgroundColor: Colors.whiteTransparent,
  },
  commentsOverlay: {
    width: '50%',
    height: '100%',
    marginRight: 0,
  },
  commentsOverlayContent: {
    height: '100%',
  },
  topActionLine: {
    flexDirection: 'column',
    gap: 8,
  },
  topActionLineText: {
    fontSize: 16,
    textAlign: 'right',
  },
});
