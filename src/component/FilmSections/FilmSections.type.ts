import { ReactNode } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export type FilmSectionsData = {
  header: string;
  films: FilmCardInterface[];
  isPlaceholder?: boolean;
}

/**
 * FlashList has no SectionList: sections are flattened into one list where a
 * header is an item of its own, told apart from film items by `type` (which
 * doubles as the `getItemType` key, so headers and films recycle separately).
 *
 * Mobile flattens a section into full-width ROW items (one item per row of
 * films). TV flattens it into individual FILM items laid out by FlashList's
 * `numColumns` grid -- every card is its own cell, the same shape FilmGrid
 * uses, which is what spatial navigation needs to focus a single card.
 */
export enum FilmSectionsItemType {
  HEADER = 'header',
  ROW = 'row',
  FILM = 'film',
}

export type FilmSectionsHeaderItem = {
  type: FilmSectionsItemType.HEADER;
  key: string;
  header: string;
}

export type FilmSectionsRowItem = {
  type: FilmSectionsItemType.ROW;
  key: string;
  films: FilmCardInterface[];
  isPlaceholder?: boolean;
}

export type FilmSectionsFilmItem = {
  type: FilmSectionsItemType.FILM;
  key: string;
  film: FilmCardInterface;
  isPlaceholder?: boolean;
  // Index to reveal when this card gains focus: the first item of its row, or
  // the section header for a section's first row, so the title scrolls in
  // together with it.
  scrollIndex: number;
}

export type FilmSectionsItem = FilmSectionsHeaderItem | FilmSectionsRowItem | FilmSectionsFilmItem;

export interface FilmSectionsContainerProps {
  data: FilmSectionsData[];
  children?: ReactNode;
  autofocus?: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
}

export interface FilmSectionsComponentProps {
  data: FilmSectionsItem[];
  stickyHeaderIndices: number[];
  /**
   * Whether `data` holds real films rather than loading placeholders -- gates
   * the TV default focus, which can only land on a focusable card.
   */
  hasFilms: boolean;
  children?: ReactNode;
  autofocus?: boolean;
  handleOnPress: (film: FilmCardInterface) => void;
}

export interface FilmSectionsHeaderProps {
  header: string;
}

export interface FilmSectionsCardProps {
  item: FilmSectionsFilmItem;
  handleOnPress: (film: FilmCardInterface) => void;
}
