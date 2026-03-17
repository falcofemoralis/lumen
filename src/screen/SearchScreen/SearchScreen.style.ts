import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text, spacing }: Theme) => ({
  content: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    marginTop: scale(12),
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(8),
  },
  actionBtn: {
    aspectRatio: 1,
    backgroundColor: colors.button,
    borderRadius: scale(99),
    padding: 0,
  },
  actionBtnIcon: {
  },
  actionBtnSearch: {
    position: 'absolute',
    left: 0,
    width: scale(34),
    height: scale(34),
    zIndex: 15,
    backgroundColor: colors.button,
    borderRadius: scale(50),
    transform: [{ translateY: '-50%' }],
    top: '50%',
  },
  searchBarContainer: {
    flex: 1,
  },
  searchBarInput: {
    marginLeft: scale(26),
    marginRight: scale(26),
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    width: scale(34),
    height: scale(34),
    zIndex: 15,
    backgroundColor: colors.button,
    borderRadius: scale(50),
    transform: [{ translateY: '-50%' }],
    top: '50%',
  },
  closeIcon: {
  },
  searchBar: {
    width: '100%',
    justifyContent: 'center',
  },
  searchBarOutline: {
    borderRadius: scale(24),
  },
  suggestionsContainer: {
    flexDirection: 'column',
    marginTop: scale(12),
  },
  suggestion: {
    flexDirection: 'row',
  },
  suggestionContent: {
    flexDirection: 'row',
    paddingVertical: scale(12),
    paddingHorizontal: scale(spacing.wrapperPadding),
    gap: scale(20),
  },
  suggestionIcon: {
    height: scale(20),
    width: scale(20),
  },
  suggestionText: {
    width: '100%',
    flex: 1,
  },
  grid: {
    marginTop: scale(12),
    width: '100%',
    flex: 1,
  },
  speakActive: {
    backgroundColor: colors.secondary,
  },
  speakActiveIcon: {
    color: colors.icon,
  },
  noResults: {
    marginTop: '20%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
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
