import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, spacing }: Theme) => ({
  item: {
    flexDirection: 'column',
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
  itemBorder: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    position: 'relative',
    flexDirection: 'row',
    gap: scale(12),
    padding: scale(6),
  },
  poster: {
    height: scale(100),
    width: 'auto',
    aspectRatio: '166 / 250',
    borderRadius: scale(8),
  },
  cardContent: {
    flexDirection: 'column',
    flex: 1,
    gap: scale(6),
  },
  title: {
    fontWeight: 'bold',
  },
  actionsBtn: {
    height: scale(40),
    width: scale(40),
    borderRadius: scale(50),
  },
  taskContainer: {
    width: '100%',
    padding: scale(12),
    borderRadius: scale(8),
    marginTop: scale(4),
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskActions: {
    flexDirection: 'row',
  },
  progressBar: {
    pointerEvents: 'none',
    marginTop: scale(8),
  },
  error: {
    color: colors.error,
  },
  overlayActions: {
    width: '100%',
    flexDirection: 'row',
  },
  empty: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
} as ThemedStyles);