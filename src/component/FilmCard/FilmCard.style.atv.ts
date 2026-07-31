import { Theme, ThemedStyles } from 'Theme/types';

import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from './FilmCard.config';

export const INFO_HEIGHT = 65;
export const INFO_PADDING_HORIZONTAL = 8;
export const INFO_PADDING_VERTICAL = 4;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  card: {
    flexDirection: 'column',
    borderRadius: scale(12),
    overflow: 'hidden',
    transform: [{ scale: 1 }],
    transitionProperty: 'transform',
    transitionDuration: '250ms',
  },
  cardFocused: {
    transform: [{ scale: 1.1 }],
  },
  posterWrapper: {
    position: 'relative',
    flexDirection: 'column',
    borderBottomRightRadius: scale(8),
    borderBottomLeftRadius: scale(8),
    overflow: 'hidden',
  },
  posterWrapperFocused: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  poster: {
    aspectRatio: `${POSTER_ASPECT_WIDTH} / ${POSTER_ASPECT_HEIGHT}`,
  },
  info: {
    paddingHorizontal: scale(INFO_PADDING_HORIZONTAL),
    paddingVertical: scale(INFO_PADDING_VERTICAL),
  },
  infoFocused: {
    backgroundColor: colors.buttonFocused,
  },
  title: {
    fontSize: scale(text.xxs.fontSize),
    fontWeight: 'bold',
    color: colors.text,
  },
  titleFocused: {
    color: colors.textFocused,
  },
  subtitle: {
    fontSize: scale(text.xxxs.fontSize),
    color: colors.textSecondary,
  },
  subtitleFocused: {
    color: colors.textFocused,
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
    fontSize: scale(text.xxs.fontSize),
    alignSelf: 'flex-end',
    color: colors.textOnContrast,
  },
  filmAdditionalText: {
    paddingHorizontal: scale(4),
    paddingVertical: scale(1),
    fontSize: scale(text.xxs.fontSize),
    alignSelf: 'flex-start',
    color: colors.textOnContrast,
  },
  posterPendingRelease: {
    opacity: 0.5,
  },
} satisfies ThemedStyles);
