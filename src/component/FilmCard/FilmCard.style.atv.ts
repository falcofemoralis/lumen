import { Theme, ThemedStyles } from 'Theme/types';

export const INFO_HEIGHT = 65;
export const INFO_PADDING_HORIZONTAL = 8;
export const INFO_PADDING_VERTICAL = 4;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  card: {
    flexDirection: 'column',
    width: '100%',
    borderRadius: scale(8),
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
    width: '100%',
    height: 'auto',
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
    aspectRatio: '166 / 250',
  },
  posterFocused: {},
  info: {
    width: '100%',
    height: scale(INFO_HEIGHT),
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
  },
  filmAdditionalText: {
    paddingHorizontal: scale(4),
    paddingVertical: scale(1),
    fontSize: scale(text.xxs.fontSize),
    alignSelf: 'flex-start',
  },
  posterPendingRelease: {
    opacity: 0.5,
  },
} satisfies ThemedStyles);
