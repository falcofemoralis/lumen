import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  background: {
  },
  container: {
  },
  voicesContainer: {
    width: '100%',
    maxHeight: 288,
    flexDirection: 'row',
    gap: 4,
  },
  seasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  season: {
    backgroundColor: Colors.gray,
  },
  seasonSelected: {
    backgroundColor: Colors.primary,
  },
  seasonText: {
    color: Colors.white,
  },
  seasonTextSelected: {
    color: Colors.lightBlue,
  },
  episodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.darkGray,
  },
  episode: {
    backgroundColor: Colors.gray,
  },
  episodeSelected: {
    backgroundColor: Colors.primary,
  },
  episodeText: {},
  episodeTextSelected: {
    color: Colors.lightBlue,
  },
  playContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playBtn: {
    margin: 8,
  },
  voiceDropdownInput: {
    flex: 1,
  },
  voiceRatingInputContainer: {
    borderRadius: 50,
  },
  voiceDropdownInputIcon: {
    flex: 1,
  },
  voiceDropdownInputIconSeason: {
    padding: 8,
  },
  voiceRatingContainer: {},
  voiceRatingItemContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  voiceRatingInfo: {
    flexDirection: 'column',
  },
  voiceRatingTextContainer: {
    flexDirection: 'column',
  },
  voiceRatingText: {
    fontSize: 16,
  },
  voiceRatingBarContainer: {
  },
  voiceRatingBar: {
    height: 10,
    width: '100%',
    backgroundColor: Colors.darkGray,
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
