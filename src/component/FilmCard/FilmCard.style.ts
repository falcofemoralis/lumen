import { Theme, ThemedStyles } from 'Theme/types';

import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from './FilmCard.config';

export const INFO_HEIGHT = 40;
export const INFO_PADDING_TOP = 8;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  card: {
    overflow: 'hidden',
  },
  posterWrapper: {
    position: 'relative',
    width: '100%',
    height: 'auto',
    overflow: 'hidden',
    borderRadius: scale(12),
  },
  poster: {
    aspectRatio: `${POSTER_ASPECT_WIDTH} / ${POSTER_ASPECT_HEIGHT}`,
  },
  posterPendingRelease: {
    opacity: 0.5,
  },
  info: {
    width: '100%',
    paddingTop: scale(INFO_PADDING_TOP),
  },
  title: {
    fontSize: scale(text.xxs.fontSize),
    fontWeight: '700',
    color: colors.text,
    paddingRight: scale(4),
  },
  subtitle: {
    fontSize: scale(text.xxxs.fontSize),
    paddingTop: scale(4),
    color: colors.textSecondary,
  },
  additionContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  typeText: {
    paddingHorizontal: scale(4),
    paddingVertical: scale(1),
    fontSize: scale(10),
    alignSelf: 'flex-end',
    color: colors.textOnContrast,
  },
  filmAdditionalText: {
    paddingHorizontal: scale(4),
    paddingVertical: scale(1),
    fontSize: scale(text.xxxs.fontSize),
    borderBottomLeftRadius: scale(8),
    alignSelf: 'flex-start',
    color: colors.textOnContrast,
  },
} satisfies ThemedStyles);
