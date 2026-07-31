import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, spacing }: Theme) => ({
  infoListHeader: {
    fontSize: scale(text.sm.fontSize),
    paddingBottom: scale(8),
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
} satisfies ThemedStyles);
