import { Colors } from 'Style/Colors';
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
    width: 36,
    height: 36,
    backgroundColor: Colors.button,
    borderRadius: 99,
    padding: 0,
  },
  actionBtnIcon: {
  },
  searchBarContainer: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    width: 36,
    height: 36,
    zIndex: 15,
    backgroundColor: Colors.button,
    borderRadius: 50,
  },
  closeIcon: {
  },
  searchBar: {
    width: '100%',
    height: 36,
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
    borderRadius: 12,
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
    width: '100%',
    height: '100%',
  },
  speakActive: {
    backgroundColor: Colors.secondary,
  },
  speakActiveIcon: {
    color: Colors.white,
  },
  noResults: {
    marginTop: '20%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
});
