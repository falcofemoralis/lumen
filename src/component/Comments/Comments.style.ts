import { Theme, ThemedStyles } from 'Theme/types';

const INDENT_SIZE = 16;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  indentSize: {
    width: scale(INDENT_SIZE),
  },
  wrapper: {
    flex: 1,
    width: '100%',
  },
  // No `width: 100%` here: Wrapper adds its own horizontal margins, and the two
  // together would push the list past the sheet's right edge.
  sheetContent: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  commentsList: {
  },
  item: {
    flexDirection: 'row',
    gap: scale(8),
    paddingBottom: scale(8),
  },
  itemEven: {
  },
  avatar: {
    height: scale(32),
    width: scale(32),
    borderRadius: scale(64),
  },
  comment: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(12),
    padding: scale(8),
  },
  commentTextWrapper: {
    width: '100%',
    flexDirection: 'column',
    marginBlock: scale(4),
  },
  commentText: {
    fontSize: scale(text.sm.fontSize),
    lineHeight: scale(16),
  },
  commentTextSmall: {
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  commentTextSmallLiked: {
    color: colors.secondary,
  },
  commentTextFocused: {
    color: colors.textFocused,
  },
  commentDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'baseline',
    width: '100%',
  },
  commentLikesBtn: {
    padding: scale(4),
    borderRadius: scale(99),
  },
  commentLikes: {
    flexDirection: 'row',
    gap: scale(4),
    alignItems: 'center',
  },
  commentActions: {
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'center',
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    padding: scale(4),
    borderRadius: scale(99),
  },
  commentReplyText: {
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
    flexDirection: 'column',
    gap: scale(4),
  },
  formTop: {
    paddingBottom: scale(12),
  },
  // Opaque and matched to the sheet: the list scrolls up to the footer's edge,
  // and anything that overshoots must not show through it.
  formFooter: {
    width: '100%',
    backgroundColor: colors.backgroundLight,
    paddingTop: scale(8),
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: scale(8),
  },
  formToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  formToolbarBtn: {
    padding: scale(8),
    borderRadius: scale(8),
    backgroundColor: colors.backgroundLight,
  },
  formInputContainer: {
    flex: 1,
  },
  formInput: {
    // a reply can run long, but the composer must not push the list off screen
    maxHeight: scale(96),
    fontSize: scale(text.sm.fontSize),
  },
  formSend: {
    padding: scale(10),
    borderRadius: scale(99),
    backgroundColor: colors.backgroundLight,
  },
  formReply: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(8),
    paddingLeft: scale(8),
    borderRadius: scale(8),
    backgroundColor: colors.backgroundLight,
  },
  formReplyText: {
    flex: 1,
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  formReplyClose: {
    padding: scale(8),
    borderRadius: scale(99),
  },
  spoiler: {
    backgroundColor: colors.button,
    color: colors.button,
  },
  // The sheet's content view is sized to the largest detent, so these must stay
  // top-aligned - anything centered or 100% tall lands below the visible area.
  loader: {
    width: '100%',
    paddingTop: scale(24),
  },
  // The overlay host (the player) does give the list its full height, so there the
  // loader is centered in it instead of pinned to the top.
  loaderCentered: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  measureText: {
    opacity: 0,
    position: 'absolute',
    alignSelf: 'baseline',
  },
  noComments: {
    width: '100%',
    alignItems: 'center',
    paddingTop: scale(24),
  },
  noCommentsCentered: {
    flex: 1,
    paddingTop: 0,
    justifyContent: 'center',
  },
  noCommentsText: {
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
    textAlign: 'center',
  },
} satisfies ThemedStyles);
