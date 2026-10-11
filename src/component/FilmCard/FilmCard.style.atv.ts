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
  // Overrides the transition above, so the zoom lands in one frame.
  cardWithoutTransition: {
    transitionProperty: 'none' as const,
  },
  posterWrapper: {
    width: '100%',
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
    width: '100%',
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
    marginRight: scale(-1),
    color: colors.textOnContrast,
    borderBottomLeftRadius: scale(8),
  },
  pendingReleaseBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: scale(32),
    height: scale(32),
    backgroundColor: colors.button,
    borderTopLeftRadius: scale(8),
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filmAdditionalText: {
    paddingHorizontal: scale(4),
    paddingVertical: scale(1),
    fontSize: scale(text.xxs.fontSize),
    borderTopLeftRadius: scale(8),
    borderTopRightRadius: scale(8),
    alignSelf: 'flex-start',
    color: colors.textOnContrast,
  },
  posterPendingRelease: {
    opacity: 0.5,
  },
  hiddenPoster: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    padding: scale(8),
    backgroundColor: colors.backgroundLight,
    // The border is always there, only ever transparent, so that gaining focus
    // does not resize the card it sits in.
    borderWidth: scale(2),
    borderColor: 'transparent',
    borderRadius: scale(12),
  },
  hiddenPosterFocused: {
    borderColor: colors.backgroundFocused,
  },
  hiddenText: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // A hidden card has no title or subtitle to fill its info block, so the space
  // those would take is held open -- a row of nothing but hidden cards would
  // otherwise come out shorter than every other row.
  hiddenInfo: {
    height: scale(INFO_HEIGHT),
  },
} satisfies ThemedStyles);
