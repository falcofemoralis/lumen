import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  containerWithComments: {
    width: '60%',
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
    backgroundColor: colors.transparent,
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
    paddingHorizontal: scale(48),
    paddingBottom: scale(32),
    backgroundColor: 'transparent',
    width: '100%',
    height: 'auto',
    zIndex: 2,
    opacity: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: scale(14),
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
    fontSize: scale(text.xxl.fontSize),
    marginBottom: scale(4),
    color: colors.textOnContrast,
  },
  subtitle: {
    fontSize: scale(text.md.fontSize),
    marginBottom: scale(20),
    color: colors.textOnContrast,
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
    height: scale(46),
    width: scale(46),
  },
  focusedAction: {
    borderRadius: scale(50),
    backgroundColor: colors.pressableHighlight,
  },
  commentsOverlay: {
    width: '40%',
    height: '100%',
    marginRight: 0,
  },
  commentsOverlayModal: {
    backgroundColor: colors.transparent,
  },
  commentsOverlayContent: {
    height: '100%',
  },
  topActionLine: {
    flexDirection: 'column',
    gap: scale(8),
  },
  topActionLineText: {
    fontSize: scale(text.sm.fontSize),
    textAlign: 'right',
    color: colors.textOnContrast,
  },
} satisfies ThemedStyles);
