import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  headerCollapse: {
    overflow: 'hidden',
    zIndex: 10,
  },
  container: {
    width: '100%',
    flexDirection: 'column',
    zIndex: 10,
    marginTop: scale(8),
    marginBottom: scale(16),
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(16),
  },
  actionBtn: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(99),
  },
  actionBtnContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: scale(8),
  },
  suggestion: {
    borderRadius: scale(99),
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
  categoriesOverlay: {
    width: '50%',
    padding: scale(16),
    // Three label + dropdown pairs plus the submit button come out just over the
    // overlay's default 50% cap, so the button was clipped by its overflow:hidden.
    maxHeight: '80%',
  },
  categories: {
    flexDirection: 'column',
    gap: scale(8),
  },
  categoriesLoader: {
    minHeight: scale(200),
  },
  categoriesSelectBtn: {
    backgroundColor: colors.primary,
    marginTop: scale(12),
  },
} satisfies ThemedStyles);
