import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { Theme, ThemedStyles } from 'Theme/types';

import { ITEMS_ON_SCREEN_TV, NUMBER_OF_COLUMNS_TV } from './MyCommentsScreen.config';

const ROW_GAP = 24;
const CONTENT_GAP = 8;
const CELL_GAP = 8;
const ACTION_BUTTON_SIZE = 48;
const TRANSITION_DURATION = '350ms';
const ZOOM = 1.1;

// Mirrors the recent screen's row grid: one column of fixed-height rows, the
// focused one zoomed as a whole block. See RecentScreen.style.atv for why the
// paddings are derived from the zoom.
export const componentStyles = ({ scale, colors, text, dimensions }: Theme) => {
  // A row grows symmetrically, so it bleeds half of the added size on every side.
  const zoomBleed = (ZOOM - 1) / 2;

  const paddingVertical = Math.max(scale(ROW_GAP), (dimensions.height / ITEMS_ON_SCREEN_TV) * zoomBleed);
  const paddingHorizontal = Math.max(scale(ROW_GAP), (dimensions.width / NUMBER_OF_COLUMNS_TV) * zoomBleed);

  const rowHeight = (dimensions.height - paddingVertical * 2) / ITEMS_ON_SCREEN_TV - scale(CELL_GAP);

  return {
    grid: {
      paddingVertical,
      paddingHorizontal,
    },
    rowStyle: {
      gap: scale(CELL_GAP),
    },
    row: {
      height: rowHeight,
      flexDirection: 'row',
      gap: scale(CONTENT_GAP),
      transform: [{ scale: 1 }],
      transitionProperty: 'transform',
      transitionDuration: TRANSITION_DURATION,
    },
    rowFocused: {
      transform: [{ scale: ZOOM }],
    },
    // The last row carries the room its own zoom bleeds past the end of the list.
    lastRow: {
      marginBottom: rowHeight * zoomBleed,
    },
    fill: {
      flex: 1,
    },
    item: {
      height: '100%',
      flexDirection: 'row',
      gap: scale(CONTENT_GAP),
      opacity: 0.7,
      transitionProperty: 'opacity',
      transitionDuration: TRANSITION_DURATION,
    },
    itemFocused: {
      opacity: 1,
    },
    posterContainer: {
      borderRadius: scale(8),
      borderWidth: scale(2),
      borderColor: colors.transparent,
      overflow: 'hidden',
    },
    posterContainerFocused: {
      borderColor: colors.icon,
    },
    // The poster drives its own width off the row height via the aspect ratio.
    poster: {
      height: '100%',
      width: 'auto',
      aspectRatio: `${POSTER_ASPECT_WIDTH} / ${POSTER_ASPECT_HEIGHT}`,
    },
    itemContent: {
      height: '100%',
      justifyContent: 'center',
      gap: scale(CONTENT_GAP),
      padding: scale(16),
      flex: 1,
    },
    title: {
      fontWeight: 'bold',
      fontSize: scale(text.sm.fontSize),
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
    actionButton: {
      alignSelf: 'center',
      width: scale(ACTION_BUTTON_SIZE),
      height: scale(ACTION_BUTTON_SIZE),
      transform: [{ scale: 1 }],
      transitionProperty: 'transform',
      transitionDuration: TRANSITION_DURATION,
      backgroundColor: colors.transparent,
      borderRadius: scale(99),
    },
    // Cancels the row zoom so the button keeps its fixed size while the rest of
    // the row grows around it.
    actionButtonUnzoomed: {
      transform: [{ scale: 1 / ZOOM }],
    },
    // Fill the fixed-size box so the whole square is the press/focus target.
    actionButtonContent: {
      flex: 1,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    empty: {
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  } satisfies ThemedStyles;
};
