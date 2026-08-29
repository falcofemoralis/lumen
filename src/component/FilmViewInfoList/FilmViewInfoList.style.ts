import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  infoListItem: {
  },
  infoListItemContent: {
    width: '100%',
    gap: scale(8),
    padding: scale(12),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  infoListName: {
    flex: 1,
    fontSize: scale(text.xs.fontSize),
  },
  infoListPosition: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(99),
    backgroundColor: colors.thumbnailHighlight,
  },
  infoListPositionText: {
    fontSize: scale(text.xxs.fontSize),
    color: colors.textSecondary,
  },
} satisfies ThemedStyles);
