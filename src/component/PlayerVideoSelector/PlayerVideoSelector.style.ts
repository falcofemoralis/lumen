import { Colors } from 'Style/Colors';
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
    backgroundColor: Colors.chip,
    padding: 8,
    borderRadius: 16,
  },
  seasonSelected: {
    backgroundColor: Colors.primary,
  },
  seasonText: {
    color: Colors.chipText,
  },
  seasonTextSelected: {
    color: Colors.textOnPrimary,
  },
  episodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.divider,
  },
  episode: {
    backgroundColor: Colors.chip,
    padding: 8,
    borderRadius: 16,
  },
  episodeSelected: {
    backgroundColor: Colors.primary,
  },
  episodeText: {},
  episodeTextSelected: {
    color: Colors.textOnPrimary,
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
    width: 36,
    height: 36,
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
