import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({
  scale, text, colors,
}: Theme) => ({
  infoListGroups: {
    gap: scale(20),
  },
  infoListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    paddingBottom: scale(8),
  },
  infoListHeaderText: {
    flex: 1,
    fontSize: scale(text.xs.fontSize),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoListHeaderCount: {
    minWidth: scale(22),
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(99),
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoListHeaderCountText: {
    fontSize: scale(text.xxs.fontSize),
    color: colors.textSecondary,
  },
  infoListCard: {
    borderRadius: scale(16),
    backgroundColor: colors.backgroundLight,
    overflow: 'hidden',
  },
  infoListDivider: {
    height: scale(1),
    marginHorizontal: scale(12),
    backgroundColor: colors.darkDivider,
  },
} satisfies ThemedStyles);
