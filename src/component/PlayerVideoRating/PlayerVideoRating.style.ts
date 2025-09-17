import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  voiceRatingInputContainer: {
    borderRadius: 50,
    width: 36,
    height: 36,
  },
  voiceDropdownInputIcon: {
    flex: 1,
  },
  voiceDropdownInputIconSeason: {
    padding: 8,
  },
  voiceRatingContainer: {
  },
  voiceRatingItemContainer: {
    flexDirection: 'row',
    paddingBlock: 8,
    paddingInline: 16,
  },
  voiceRatingInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  voiceRatingTextContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  voiceRatingText: {
    fontSize: 16,
  },
  voiceRatingImage: {
    height: 20,
    width: 20,
  },
  voiceRatingBarContainer: {
    width: '100%',
  },
  voiceRatingBar: {
    height: 6,
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
});