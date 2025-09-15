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
  controlsContainer: {
    position: 'absolute',
    backgroundColor: Colors.transparent,
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    zIndex: 55,
    flexDirection: 'row',
  },
  controls: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: Colors.modal,
  },
  controlsDisabled: {
    pointerEvents: 'none',
  },
  topActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 100,
  },
  middleActions: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    flexDirection: 'row',
    gap: 80,
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 16,
    marginBottom: 16,
  },
  control: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    backgroundColor: Colors.modal,
    borderRadius: 50,
  },
  controlBig: {
    width: 48,
    height: 48,
  },
  durationRow: {
    marginBottom: 16,
  },
  progressBarRow: {
    marginBottom: 16,
  },
  progressBarRowLocked: {
    pointerEvents: 'none',
  },
  topInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  action: {
    borderRadius: 50,
    width: 42,
    height: 42,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  bottomActionsRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomActionsRow: {
    justifyContent: 'flex-end',
  },
  bottomActionsRowLocked: {
    opacity: 0,
    pointerEvents: 'none',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {},
  commentsOverlayModal: {
    backgroundColor: Colors.transparent,
  },
  commentsOverlay: {
    width: '100%',
    height: '100%',
  },
  commentsOverlayContent: {
    height: '100%',
    maxHeight: '100%',
    maxWidth: '50%',
    right: 0,
  },
  commentsOverlayList: {
    height: '100%',
  },
  doubleTapAction: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    alignItems: 'center',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  doubleTapActionVisible: {
    opacity: 1,
  },
  doubleTapActionLeft: {
    left: '20%',
  },
  doubleTapActionRight: {
    left: '80%',
  },
  doubleTapContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  doubleTapIcon: {
    backgroundColor: Colors.modal,
    padding: 10,
    borderRadius: 50,
  },
  doubleTapText: {
    fontSize: 16,
    fontWeight: '700',
  },
  longTapAction: {
    position: 'absolute',
    top: '80%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    alignItems: 'center',
  },
  longTapContainer: {
    backgroundColor: Colors.modal,
    paddingBlock: 4,
    paddingInline: 12,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  longTapActionVisible: {
    opacity: 1,
  },
  longTapText: {
    fontSize: 16,
    fontWeight: '700',
  },
  longTapIcon: {
  },
  topActionLine: {
    flexDirection: 'column',
    gap: 8,
  },
});

export type MiddleActionVariant = 'big' | 'small';
