import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    maxHeight: 300,
  },
  voicesInput: {
    marginBottom: 10,
  },
  episodesContainer: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  button: {
    marginEnd: 10,
    marginBottom: 10,
  },
  voicesWrapper: {
    width: '100%',
    minWidth: 288,
    maxHeight: 288,
    flexDirection: 'column',
    gap: 4,
  },
  voicesContainer: {
    flex: 1,
  },
  voicesListContainer: {
    width: '100%',
    maxHeight: 288,
    flexDirection: 'column',
    gap: 4,
  },
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
  voiceRatingContainer: {
    flexDirection: 'column',
    height: '100%',
  },
  voiceRatingItemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
  },
  voiceRatingItemContainerFocused: {
    backgroundColor: Colors.backgroundFocused,
  },
  voiceRatingInfo: {
    flexDirection: 'column',
  },
  voiceRatingTextContainer: {
    flexDirection: 'column',
  },
  voiceRatingTextFocused: {
    color: Colors.textFocused,
  },
  voiceRatingText: {
    fontSize: 16,
  },
  voiceRatingBarContainer: {
  },
  voiceRatingBar: {
    height: 10,
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
