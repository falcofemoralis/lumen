import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, spacing, text }: Theme) => ({
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
    aspectRatio: `${POSTER_ASPECT_WIDTH} / ${POSTER_ASPECT_HEIGHT}`,
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
  recentTopAction: {
    position: 'absolute',
    top: 0,
    right: scale(4),
    width: scale(44),
    height: scale(44),
    zIndex: 30,
    elevation: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTopBadge: {
    backgroundColor: colors.secondary,
    width: scale(16),
    height: scale(16),
    borderRadius: scale(50),
    color: colors.textOnContrast,
    fontSize: scale(text.xxs.fontSize),
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'absolute',
    right: scale(7),
    top: scale(3),
    zIndex: 40,
    elevation: 40,
  },
} satisfies ThemedStyles);
