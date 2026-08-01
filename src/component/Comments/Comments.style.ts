import { Theme, ThemedStyles } from 'Theme/types';

const INDENT_SIZE = 16;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  indentSize: {
    width: scale(INDENT_SIZE),
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
  noCommentsText: {
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
    textAlign: 'center',
  },
} satisfies ThemedStyles);
