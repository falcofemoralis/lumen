import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, spacing, text }: Theme) => ({
  item: {
    flexDirection: 'row',
    paddingVertical: scale(12),
    gap: scale(10),
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
  title: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },
  replyTo: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
  },
  text: {
    fontSize: scale(text.sm.fontSize),
  },
  forgetButton: {
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
} satisfies ThemedStyles);
