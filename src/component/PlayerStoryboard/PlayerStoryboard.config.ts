export const STORYBOARD_TILES_COUNT = 5;
export const STORYBOARD_TILE_HEIGHT = 75;
export const STORYBOARD_TILE_WIDTH = 150;

// How many frames are shown either side of the current one, and how much smaller they
// are drawn -- the size is what marks the middle tile as the frame the playhead is on.
// The whole strip is `1 + 2 * SIDE_TILES` wide: on a TV that is 225 + 4 * 169 + gaps,
// about all a 960dp screen has to give, while the phone bubble follows the thumb and
// would hang off the screen at either end of the timeline, so it settles for one.
export const STORYBOARD_SIDE_TILES_TV = 2;
export const STORYBOARD_SIDE_TILES_MOBILE = 1;
export const STORYBOARD_SIDE_SCALE = 0.75;
export const STORYBOARD_TILE_GAP = 4;

export const NO_CUE = -1;
