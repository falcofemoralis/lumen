import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  franchiseItem: {
    flexDirection: 'row',
    gap: scale(12),
    paddingBlock: scale(12),
    paddingInline: scale(8),
  },
  franchiseItemFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(8),
  },
  franchiseName: {
    flex: 1,
  },
  franchiseText: {
    fontSize: scale(text.xs.fontSize),
  },
  franchiseTextFocused: {
    color: colors.textFocused,
  },
  franchiseSelected: {
    color: colors.secondary,
  },
} satisfies ThemedStyles);
