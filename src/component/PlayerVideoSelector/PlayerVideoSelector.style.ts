import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  background: {
  },
  container: {
  },
  voicesContainer: {
    width: '100%',
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
    borderRadius: 16,
  },
  seasonContent: {
    padding: 8,
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
    borderRadius: 16,
  },
  episodeContent: {
    padding: 8,
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
  buttonProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonProgressOutline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0283d1',
    backgroundColor: 'transparent',
  },
  buttonProgressMask: {
    position: 'absolute',
    top: -2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
  },
});
