import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  voiceRatingInputContainer: {
    borderRadius: scale(50),
    width: scale(36),
    height: scale(36),
  },
  voiceDropdownInputIcon: {
    flex: 1,
  },
  voiceDropdownInputIconSeason: {
    padding: scale(8),
  },
  voiceRatingContainer: {
  },
  voiceRatingItemContainer: {
    flexDirection: 'row',
    paddingBlock: scale(8),
    paddingInline: scale(16),
  },
  voiceRatingInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  voiceRatingTextContainer: {
    flexDirection: 'row',
    gap: scale(4),
  },
  voiceRatingText: {
    fontSize: scale(text.sm.fontSize),
  },
  voiceRatingImage: {
    height: scale(20),
    width: scale(20),
  },
  voiceRatingBarContainer: {
    width: '100%',
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
} satisfies ThemedStyles);
