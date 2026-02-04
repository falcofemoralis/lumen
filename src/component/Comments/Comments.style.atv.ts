import { Theme, ThemedStyles } from 'Theme/types';

const ITEM_ELEMENTS_HEIGHT = 20;
const OVERLAY_PADDING = 16 * 2;
const INDENT_SIZE = 16;

const ITEM_PADDING = 8;
const BOTTOM_PADDING = 8;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  indentSize: {
    width: scale(INDENT_SIZE),
  },
  itemAdditionalHeight: {
    height: scale(ITEM_ELEMENTS_HEIGHT) * 2 + scale(ITEM_PADDING) * 2 + scale(BOTTOM_PADDING),
  },
  overlayPadding: {
    padding: scale(OVERLAY_PADDING),
  },
  wrapper: {
    flexDirection: 'column',
    width: '100%',
  },
  commentsList: {
  },
  item: {
    flexDirection: 'row',
    gap: scale(8),
    paddingBottom: BOTTOM_PADDING,
  },
  itemFocused: {
    backgroundColor: colors.backgroundLighter,
  },
  avatar: {
    height: scale(32),
    width: scale(32),
    borderRadius: scale(64),
  },
  comment: {
    flexDirection: 'column',
    backgroundColor: colors.button,
    borderRadius: scale(12),
    padding: ITEM_PADDING,
  },
  commentTextWrapper: {
    width: '100%',
    flexDirection: 'column',
    marginBlock: scale(4),
  },
  commentText: {
    fontSize: scale(16),
    lineHeight: scale(16),
  },
  commentTextSmall: {
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  commentTextFocused: {
  },
  commentDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'baseline',
    width: '100%',
  },
  commentLikes: {
    flexDirection: 'row',
    gap: scale(4),
    alignItems: 'center',
  },
  spoiler: {
    backgroundColor: colors.backgroundLight,
    color: colors.backgroundLight,
  },
  textFocused: {
  },
  loader: {
    alignSelf: 'center',
    height: '100%',
    width: '100%',
  },
  measureText: {
    opacity: 0,
    position: 'absolute',
    alignSelf: 'baseline',
  },
  noComments: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  noCommentsText: {
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
    textAlign: 'center',
  },
} satisfies ThemedStyles);
