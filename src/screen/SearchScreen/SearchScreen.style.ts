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
    alignItems: 'center',
    width: '100%',
    gap: scale(8),
  },
  actionBtn: {
    width: scale(34),
    height: scale(34),
    flexShrink: 0,
    backgroundColor: colors.button,
    borderRadius: scale(16),
    padding: 0,
  },
  actionBtnIcon: {},
  actionBtnSearch: {
    width: scale(34),
    height: scale(34),
    flexShrink: 0,
  },
  searchBarContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  searchBarInput: {
    minHeight: scale(34),
    paddingVertical: scale(8),
  },
  closeBtn: {
    width: scale(34),
    height: scale(34),
    flexShrink: 0,
  },
  closeIcon: {},
  searchBar: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: scale(4),
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
