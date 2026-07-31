import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, spacing }: Theme) => ({
  infoListItem: {
  },
  infoListItemContent: {
    width: '100%',
    padding: scale(8),
    paddingHorizontal: scale(spacing.wrapperPadding),
    justifyContent: 'flex-start',
  },
  infoListName: {
  },
} satisfies ThemedStyles);
