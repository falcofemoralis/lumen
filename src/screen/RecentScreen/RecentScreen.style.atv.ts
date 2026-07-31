import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { Theme, ThemedStyles } from 'Theme/types';

import { ITEMS_ON_SCREEN_TV } from './RecentScreen.config';

const ROW_GAP = 24;
const CELL_GAP = 8;
const ACTION_BUTTON_SIZE = 64;
const ZOOM = 1.1;
// A row grows symmetrically, so it bleeds half of the added size on every side.
const ZOOM_BLEED = (ZOOM - 1) / 2;
const TRANSITION_DURATION = '350ms';

export const componentStyles = ({ scale, colors, text, dimensions }: Theme) => {
  // The grid has to reserve the room the focused row bleeds into, otherwise the
  // scaled row is clipped by the list viewport -- on the sides for every row,
  // and on top for the first one. Both paddings are derived from ZOOM so they
  // stay correct if the zoom is retuned.
  const paddingVertical = Math.max(scale(ROW_GAP), (dimensions.height / ITEMS_ON_SCREEN_TV) * ZOOM_BLEED);
  const paddingHorizontal = Math.max(scale(ROW_GAP), dimensions.width * ZOOM_BLEED);

  // Each row takes screen height / ITEMS_ON_SCREEN_TV so exactly that many rows
  // are visible. The grid padding and the gap the grid adds around every cell
  // are subtracted, otherwise the last row is cut off.
  const rowHeight = (dimensions.height - paddingVertical * 2) / ITEMS_ON_SCREEN_TV - scale(CELL_GAP);

  return {
    grid: {
      paddingVertical,
      paddingHorizontal,
    },
    rowStyle: {
      gap: scale(CELL_GAP),
    },
    // One grid cell holds the whole row: the recent item takes the remaining
    // space, the two action buttons keep a fixed square size. The focus zoom
    // lives here rather than on the item, because ThemedPressable's wrapper
    // forces overflow: 'hidden' and would clip a scaled child.
    row: {
      height: rowHeight,
      flexDirection: 'row',
      gap: scale(CELL_GAP),
      transform: [{ scale: 1 }],
      transitionProperty: 'transform',
      transitionDuration: TRANSITION_DURATION,
    },
    rowFocused: {
      transform: [{ scale: ZOOM }],
    },
    fill: {
      flex: 1,
    },
    item: {
      height: '100%',
      flexDirection: 'row',
      gap: scale(CELL_GAP),
      opacity: 0.7,
      transitionProperty: 'opacity',
      transitionDuration: TRANSITION_DURATION,
    },
    itemHidden: {
      opacity: 0.5,
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
      borderWidth: scale(2),
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
      gap: scale(CELL_GAP),
      padding: scale(16),
      flex: 1,
    },
    name: {
      fontWeight: 'bold',
      fontSize: scale(text.sm.fontSize),
    },
    nameFocused: {
    },
    date: {
    },
    dateFocused: {
    },
    info: {
    },
    infoFocused: {
    },
    additionalInfo: {
    },
    additionalInfoFocused: {
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
    // Cancels the row zoom so the buttons keep their fixed size while the rest
    // of the row grows around them.
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
