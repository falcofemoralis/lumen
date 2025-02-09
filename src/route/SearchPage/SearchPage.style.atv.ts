import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    flexDirection: 'column',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  actionBtn: {
    width: 48,
    height: 48,
  },
  searchBarContainer: {
    flex: 1,
  },
  searchBar: {
    width: '100%',
    height: 48,
  },
  suggestionsWrapper: {
    marginTop: 16,
    height: 36,
  },
  suggestions: {
    gap: 12,
  },
  grid: {
    paddingTop: 24,
  },
  speakActive: {
    backgroundColor: Colors.secondary,
  },
  speakActiveIcon: {
    color: Colors.white,
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
});
