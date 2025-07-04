import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    flexDirection: 'column',
    zIndex: 10,
    marginTop: 16,
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
    borderRadius: 50,
    paddingHorizontal: 16,
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
    color: Colors.text,
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  noResults: {
    marginTop: '20%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
});
