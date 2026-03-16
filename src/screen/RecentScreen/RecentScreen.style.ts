import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, spacing }: Theme) => ({
  item: {
    flexDirection: 'row',
    paddingVertical: scale(12),
    gap: scale(10),
  },
  itemHidden: {
    opacity: 0.5,
  },
  itemContentWrapper: {
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
  itemBorder: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  itemContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(10),
  },
  poster: {
    height: scale(100),
    width: 'auto',
    aspectRatio: '166 / 250',
    borderRadius: scale(8),
  },
  itemContent: {
    flexDirection: 'column',
    flex: 1,
    gap: scale(6),
  },
  name: {
    fontWeight: 'bold',
  },
  date: {
  },
  info: {
  },
  additionalInfo: {
  },
  deleteButton: {
    height: scale(40),
    width: scale(40),
    borderRadius: scale(50),
  },
  empty: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsColumn: {
    flexDirection: 'column',
    gap: scale(4),
  },
} satisfies ThemedStyles);
