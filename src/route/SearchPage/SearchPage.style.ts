import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    flexDirection: 'column',
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    width: 32,
    height: 32,
    backgroundColor: Colors.gray,
    borderRadius: 99,
    padding: 0,
  },
  actionBtnIcon: {
    height: 18,
    width: 18,
  },
  searchBarContainer: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    right: 8,
    width: 20,
    height: '100%',
    zIndex: 15,
    backgroundColor: Colors.gray,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  searchBar: {
    width: '100%',
    height: 32,
    backgroundColor: Colors.gray,
    color: Colors.white,
  },
  searchBarOutline: {
    borderRadius: 24,
  },
  suggestionsContainer: {
    flexDirection: 'column',
    marginTop: 12,
  },
  suggestion: {
    flexDirection: 'row',
    padding: 12,
    gap: 20,
  },
  suggestionIcon: {
    height: 20,
    width: 20,
  },
  suggestionText: {
    width: '100%',
    flex: 1,
  },
  grid: {
    marginTop: 12,
  },
  speakActive: {
    backgroundColor: Colors.secondary,
  },
  speakActiveIcon: {
    color: Colors.white,
  },
});
