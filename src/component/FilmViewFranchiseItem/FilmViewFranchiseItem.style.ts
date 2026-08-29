import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors, spacing }: Theme) => ({
  franchiseItemButton: {
  },
  franchiseItemButtonContent: {
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
  franchiseItem: {
    flexDirection: 'row',
    gap: scale(12),
    paddingBlock: scale(12),
  },
  franchiseName: {
    flex: 1,
  },
  franchiseText: {
    fontSize: scale(text.xs.fontSize),
  },
  franchiseSelected: {
    color: colors.secondary,
  },
} satisfies ThemedStyles);
