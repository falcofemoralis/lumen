import { ComponentType, ReactElement } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';

/** A group of films rendered under a title of its own. */
export type FilmGridSection = {
  header: string;
  films: FilmCardInterface[];
  isPlaceholder?: boolean;
}

/**
 * FlashList has no SectionList: sections are flattened into one list where a
 * header is an item of its own, told apart from film items by `type` (which
 * doubles as the `getItemType` key, so headers and films recycle separately).
 * A header spans the full width (see `overrideItemLayout`), which also breaks
 * the row -- a section always starts on a fresh line even when the previous one
 * ended mid-row. A plain grid is just the degenerate case: one headerless
 * section.
 */
export enum FilmGridItemType {
  HEADER = 'header',
  FILM = 'film',
}

export type FilmGridHeaderItem = {
  type: FilmGridItemType.HEADER;
  key: string;
  header: string;
}

export type FilmGridFilmItem = {
  type: FilmGridItemType.FILM;
  key: string;
  film: FilmCardInterface;
  isPlaceholder?: boolean;
  // Index to reveal when this card gains focus: the first item of its row, or
  // the section header for a section's first row, so the title scrolls in
  // together with it. Every card of a row shares it, which is what tells a row
  // change apart from moving within a row.
  scrollIndex: number;
  /**
   * Position in the grid, counted across sections. A header spans the full width
   * and so breaks the row, which is why this cannot be derived from the item's
   * index in `data` -- and why it is stored rather than computed.
   *
   * Spatial navigation reads these to work out the neighbour in a given
   * direction arithmetically, instead of measuring every mounted card.
   */
  row: number;
  column: number;
}

export type FilmGridItem = FilmGridHeaderItem | FilmGridFilmItem;

export interface FilmGridContainerProps {
  /** A flat grid of films. Mutually exclusive with `sections`. */
  films?: FilmCardInterface[];
  /** Films grouped under headers. Mutually exclusive with `films`. */
  sections?: FilmGridSection[];
  disableEmptyComponent?: boolean;
  isEmpty?: boolean;
  hideGrid?: boolean;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  /** Stretch the list content over the whole grid, so the empty component sits
   * in the middle of it rather than at the top. */
  centerEmptyComponent?: boolean;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  /**
   * Whether the source still has pages left to load. Drives the mobile footer:
   * a spinner while more is coming, an end marker once it is not. Left out when
   * the caller cannot tell, in which case the footer falls back to spinning only
   * while a page is actually in flight.
   */
  hasMorePages?: boolean;
  // Mobile related
  disableStatusbarSafeArea?: boolean;
  // TV related
  disableAutofocus?: boolean;
  /** Fired when grid focus enters (true) or leaves (false) the first row. */
  onAtTopChange?: (atTop: boolean) => void;
}

type FilmGridLayoutProps = Omit<FilmGridContainerProps, 'films' | 'sections' | 'onNextLoad'>;

export interface FilmGridComponentProps extends FilmGridLayoutProps {
  data: FilmGridItem[];
  /** Positions of the header items within `data`. */
  stickyHeaderIndices: number[];
  /**
   * Whether `data` holds real films rather than loading placeholders -- gates
   * the TV default focus, which can only land on a focusable card.
   */
  hasFilms: boolean;
  /** Whether the films came in grouped -- drives the section-specific spacing. */
  isSectioned: boolean;
  numberOfColumns: number;
  isRefreshing: boolean;
  /** Whether a next page requested by scrolling to the end is still in flight. */
  isLoadingNext: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
  handleScrollEnd?: () => void;
  handleRefresh?: () => void;
}

export interface FilmGridHeaderProps {
  header: string;
}

/** What the grid keeps for each mounted card, keyed by its focus key. */
export interface FilmGridCardHandle {
  item: FilmGridFilmItem;
  /**
   * Switches the card's focus zoom between gliding and snapping. Called on just
   * the two cards a move involves, so the grid can drop the transition where it
   * would compete with drawing a row without re-rendering every other card.
   */
  setInstantZoom: (instant: boolean) => void;
}

/**
 * Announces a mounted card to the grid, returning the deregister cleanup. Lets
 * spatial navigation map a focus key back onto the grid position the card
 * occupies, and reach back into the card that is about to be focused.
 */
export type RegisterCard = (focusKey: string, handle: FilmGridCardHandle) => () => void;

export interface FilmGridItemProps {
  item: FilmGridFilmItem;
  // TV related
  isLastRow?: boolean;
  registerCard?: RegisterCard;
  handleOnPress: (film: FilmCardInterface) => void;
}
