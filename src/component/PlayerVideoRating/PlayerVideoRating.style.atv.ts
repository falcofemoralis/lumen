import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  voiceRatingInput: {
    backgroundColor: Colors.transparent,
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  voiceRatingInputIcon: {
    padding: 0,
    margin: 0,
  },
  voiceRatingOverlay: {
    width: 400,
    height: 350,
  },
  voiceRatingOverlayContainer: {
    padding: 4,
  },
  voiceRatingContainer: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  voiceRatingNavigationView: {
    paddingBlock: 4,
    paddingHorizontal: 12,
  },
  voiceRatingItemContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  voiceRatingItemContainerFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 16,
  },
  voiceRatingInfo: {
    flexDirection: 'column',
  },
  voiceRatingTextContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  voiceRatingTextFocused: {
    color: Colors.textFocused,
  },
  voiceRatingText: {
    fontSize: 16,
  },
  voiceRatingImage: {
    height: 20,
    width: 20,
  },
  voiceRatingBarContainer: {
  },
  voiceRatingBar: {
    height: 8,
    width: '100%',
    backgroundColor: Colors.backgroundLighter,
    borderRadius: 16,
    marginTop: 8,
  },
  voiceRatingBarActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: Colors.secondary,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  voiceRatingPercentContainer: {
    width: 60,
    justifyContent: 'flex-end',
    textAlign: 'center',
  },
  voiceRatingPercent: {
    fontSize: 16,
    textAlign: 'right',
  },
  voiceRatingPercentFocused: {
    color: Colors.textFocused,
  },
});