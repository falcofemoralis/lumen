export const THUMBNAILS_ROWS = 4;
export const THUMBNAILS_ROWS_TV = 2;

// Sections sit under a screen header of their own, so their loading state fills
// fewer rows.
export const SECTION_THUMBNAILS_ROWS = 3;
export const SECTION_THUMBNAILS_ROWS_TV = 1;

/**
 * Rows FlashList keeps mounted beyond the visible area (TV). Focus jumps a whole
 * row at a time, so the row the user is about to enter has to be drawn already --
 * mounting it on arrival is what makes a row change feel delayed on a slow box.
 *
 * Do not raise this freely: Norigin re-measures every mounted sibling of the
 * focused card on each key press (its layouts go stale after 16ms), so each extra
 * row also adds a column's worth of native measure calls per press. 1-2 rows is
 * the useful range -- past that the measuring costs more than the mounting saved.
 */
export const DRAW_DISTANCE_ROWS_TV = 1;

/**
 * How close to the end of the grid focus has to get before the next page is
 * requested (TV). Scroll-driven pagination is too late here: the list stops
 * scrolling at its last row, so by the time the scroll reaches the end the user
 * is already parked at the bottom of the screen waiting for the page.
 */
export const PRELOAD_ROWS_TV = 3;
