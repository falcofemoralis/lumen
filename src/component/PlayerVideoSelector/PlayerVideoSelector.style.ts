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
  },
  voice: {
    backgroundColor: Colors.gray,
    margin: 8,
  },
  voiceText: {},
  voiceTextSelected: {
    color: 'green',
  },
  seasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  season: {
    backgroundColor: Colors.gray,
  },
  seasonSelected: {
    backgroundColor: Colors.primary,
  },
  seasonText: {
    color: 'white',
  },
  seasonTextSelected: {
    color: Colors.lightBlue,
  },
  episodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});
