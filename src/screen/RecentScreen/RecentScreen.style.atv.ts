import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { Theme, ThemedStyles } from 'Theme/types';

import {
  ITEMS_ON_SCREEN_TV,
  NUMBER_OF_COLUMNS_TV,
  NUMBER_OF_COLUMNS_TV_TWO_COLUMNS,
} from './RecentScreen.config';

const ROW_GAP = 24;
const CONTENT_GAP = 8;
const ACTION_BUTTON_SIZE = 48;
const TRANSITION_DURATION = '350ms';

// The layout is driven by the column count, which the `recentTwoColumnsTV`
// setting picks -- so the styles are built per layout instead of read from the
// theme alone. Both variants are created once at module scope, keeping the
// function identity `useThemedStyles` memoizes on stable.
type Layout = {
  numberOfColumns: number;
  // How many rows fit on screen; the row height is derived from it.
  itemsOnScreen: number;
  // Gutter between grid cells. A single column only has to separate rows, which
  // overlap harmlessly; two columns put a focused row next to an unfocused one,
  // and the cell FlashList renders later draws on top -- so the gutter has to
  // swallow the zoom bleed, otherwise the neighbour's poster covers the focused
  // row's action buttons.
  cellGap: number;
  zoom: number;
};

const createComponentStyles = ({
  numberOfColumns,
  itemsOnScreen,
  cellGap,
  zoom,
}: Layout) => ({ scale, colors, text, dimensions }: Theme) => {
  // A row grows symmetrically, so it bleeds half of the added size on every side.
  const zoomBleed = (zoom - 1) / 2;

  // The grid has to reserve the room the focused row bleeds into, otherwise the
  // scaled row is clipped by the list viewport -- on the sides for every row,
  // and on top for the first one. Both paddings are derived from the zoom so they
  // stay correct if it is retuned. A cell is only as wide as its share of the
  // screen, so the horizontal bleed shrinks with every extra column.
  const paddingVertical = Math.max(scale(ROW_GAP), (dimensions.height / itemsOnScreen) * zoomBleed);
  const paddingHorizontal = Math.max(scale(ROW_GAP), (dimensions.width / numberOfColumns) * zoomBleed);

  // Each row takes screen height / itemsOnScreen so exactly that many rows
  // are visible. The grid padding and the gap the grid adds around every cell
  // are subtracted, otherwise the last row is cut off.
  const rowHeight = (dimensions.height - paddingVertical * 2) / itemsOnScreen - scale(cellGap);
  const cellWidth = `${100 / numberOfColumns}%` as const;

  return {
    grid: {
      paddingVertical,
      paddingHorizontal,
    },
    rowStyle: {
      gap: scale(cellGap),
    },
    // The loading state renders its rows itself rather than through FlashList,
    // so it has to reproduce the grid: cells wrap into rows of `numberOfColumns`.
    thumbnailGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    // ThemedGrid pads every cell with half of `rowStyle`'s gap, and gives it an
    // even share of the row; the placeholder cells repeat both, or the
    // placeholder posters sit off the real ones.
    cell: {
      width: cellWidth,
      padding: scale(cellGap) / 2,
    },
    // One grid cell holds the whole row: the recent item takes the remaining
    // space, the two action buttons keep a fixed square size. The focus zoom
    // lives here rather than on the item, because ThemedPressable's wrapper
    // forces overflow: 'hidden' and would clip a scaled child.
    row: {
      height: rowHeight,
      flexDirection: 'row',
      gap: scale(CONTENT_GAP),
      transform: [{ scale: 1 }],
      transitionProperty: 'transform',
      transitionDuration: TRANSITION_DURATION,
    },
    rowFocused: {
      transform: [{ scale: zoom }],
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
      gap: scale(CONTENT_GAP),
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
      transform: [{ scale: 1 / zoom }],
    },
    // Fill the fixed-size box so the whole square is the press/focus target.
    actionButtonContent: {
      flex: 1,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    overlayActions: {
      width: '100%',
      flexDirection: 'row',
    },
    empty: {
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  } satisfies ThemedStyles;
};

export const componentStyles = createComponentStyles({
  numberOfColumns: NUMBER_OF_COLUMNS_TV,
  itemsOnScreen: ITEMS_ON_SCREEN_TV,
  cellGap: 8,
  zoom: 1.1,
});

// Half-width cells leave less room to grow into, so the zoom is toned down and
// the gutter widened until the bleed (cell width * (zoom - 1) / 2) fits inside it.
export const componentStylesTwoColumns = createComponentStyles({
  numberOfColumns: NUMBER_OF_COLUMNS_TV_TWO_COLUMNS,
  itemsOnScreen: ITEMS_ON_SCREEN_TV,
  cellGap: 32,
  zoom: 1.06,
});
