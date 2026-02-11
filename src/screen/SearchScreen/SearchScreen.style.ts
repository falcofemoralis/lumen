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
    gap: scale(12),
  },
  actionBtn: {
    width: scale(36),
    height: scale(36),
    backgroundColor: colors.button,
    borderRadius: scale(99),
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
    width: scale(36),
    height: scale(36),
    zIndex: 15,
    backgroundColor: colors.button,
    borderRadius: scale(50),
  },
  closeIcon: {
  },
  searchBar: {
    width: '100%',
    height: scale(36),
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
} satisfies ThemedStyles);
