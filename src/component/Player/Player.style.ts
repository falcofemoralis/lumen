import { Theme, ThemedStyles } from 'Theme/types';

import { DOUBLE_TAP_ANIMATION_DELAY } from './Player.config';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    backgroundColor: colors.transparent,
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
    backgroundColor: colors.modal,
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
    padding: scale(16),
    zIndex: 100,
  },
  middleActions: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    flexDirection: 'row',
    gap: scale(80),
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: scale(16),
    marginBottom: scale(16),
  },
  control: {
    alignSelf: 'center',
    width: scale(40),
    height: scale(40),
    backgroundColor: colors.modal,
    borderRadius: scale(50),
  },
  controlBig: {
    width: scale(48),
    height: scale(48),
  },
  durationRow: {
    marginBottom: scale(16),
  },
  progressBarRow: {
    marginBottom: scale(16),
  },
  progressBarRowLocked: {
    pointerEvents: 'none',
  },
  topInfoWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
  },
  topInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: scale(4),
  },
  action: {
    borderRadius: scale(50),
    width: scale(42),
    height: scale(42),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: scale(24),
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
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
    color: colors.textOnContrast,
  },
  subtitle: {
    color: colors.textOnContrast,
  },
  commentsOverlayModal: {
    backgroundColor: colors.transparent,
  },
  commentsOverlay: {
    width: '100%',
    height: '100%',
  },
  commentsOverlayContent: {
    height: '100%',
    maxHeight: '100%',
    maxWidth: '50%',
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
    transitionDuration: `${DOUBLE_TAP_ANIMATION_DELAY}ms`,
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
    backgroundColor: colors.modal,
    padding: scale(10),
    borderRadius: scale(50),
  },
  doubleTapText: {
    fontSize: scale(text.sm.fontSize),
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
    backgroundColor: colors.modal,
    paddingBlock: scale(4),
    paddingInline: scale(12),
    borderRadius: scale(50),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  longTapActionVisible: {
    opacity: 1,
  },
  longTapText: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
    color: colors.textOnContrast,
  },
  longTapIcon: {
  },
  topActionLine: {
    flexDirection: 'column',
    gap: scale(8),
  },
  topActionLineText: {
    color: colors.textOnContrast,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(36),
    height: scale(36),
    borderRadius: scale(100),
  },
  backButtonContent: {
    padding: scale(12),
  },
} satisfies ThemedStyles);

export type MiddleActionVariant = 'big' | 'small';
