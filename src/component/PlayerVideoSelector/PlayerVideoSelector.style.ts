import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  background: {
    padding: 8,
  },
  container: {
    backgroundColor: Colors.background,
    padding: 8,
  },
  voicesContainer: {
    width: '100%',
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
  },
  season: {
    backgroundColor: Colors.gray,
    margin: 8,
  },
  seasonText: {
    color: 'white',
  },
  seasonTextSelected: {
    color: 'green',
  },
  episodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  episode: {
    backgroundColor: Colors.gray,
    margin: 8,
  },
  episodeText: {},
  episodeTextSelected: {
    color: 'green',
  },
  playContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playBtn: {
    margin: 8,
  },
});
