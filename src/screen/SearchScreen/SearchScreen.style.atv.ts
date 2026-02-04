import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    flexDirection: 'column',
    zIndex: 10,
    marginTop: scale(16),
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(16),
  },
  actionBtn: {
    width: scale(48),
    height: scale(48),
    justifyContent: 'center',
  },
  searchBarContainer: {
    flex: 1,
  },
  searchBar: {
    width: '100%',
    height: scale(48),
    borderRadius: scale(50),
    paddingHorizontal: scale(16),
    fontSize: scale(text.sm.fontSize),
  },
  suggestionsWrapper: {
    marginTop: scale(16),
    height: scale(48),
  },
  suggestions: {
    gap: scale(12),
  },
  grid: {
    paddingTop: scale(24),
  },
  speakActive: {
    backgroundColor: colors.secondary,
  },
  speakActiveIcon: {
    color: colors.text,
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
} satisfies ThemedStyles);
