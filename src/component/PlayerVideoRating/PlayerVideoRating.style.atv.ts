import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  voiceRatingInput: {
    backgroundColor: colors.transparent,
    width: scale(40),
    height: scale(40),
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  voiceRatingInputIcon: {
    padding: 0,
    margin: 0,
  },
  voiceRatingOverlay: {
    width: scale(400),
    height: scale(350),
  },
  voiceRatingOverlayContainer: {
    padding: scale(4),
  },
  voiceRatingContainer: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  voiceRatingNavigationView: {
    paddingBlock: scale(4),
    paddingHorizontal: scale(12),
  },
  voiceRatingItemContainer: {
    flexDirection: 'row',
    padding: scale(16),
  },
  voiceRatingItemContainerFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(16),
  },
  voiceRatingInfo: {
    flexDirection: 'column',
  },
  voiceRatingTextContainer: {
    flexDirection: 'row',
    gap: scale(4),
  },
  voiceRatingTextFocused: {
    color: colors.textFocused,
  },
  voiceRatingText: {
    fontSize: scale(text.sm.fontSize),
  },
  voiceRatingImage: {
    height: scale(20),
    width: scale(20),
  },
  voiceRatingBarContainer: {
  },
  voiceRatingBar: {
    height: scale(8),
    width: '100%',
    backgroundColor: colors.backgroundLighter,
    borderRadius: scale(16),
    marginTop: scale(8),
  },
  voiceRatingBarActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.secondary,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  voiceRatingPercentContainer: {
    width: scale(60),
    justifyContent: 'flex-end',
    textAlign: 'center',
  },
  voiceRatingPercent: {
    fontSize: scale(text.sm.fontSize),
    textAlign: 'right',
  },
  voiceRatingPercentFocused: {
    color: colors.textFocused,
  },
} satisfies ThemedStyles);
