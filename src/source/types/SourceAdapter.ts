import { FilmCardInterface } from 'Type/FilmCard.interface';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmRatingsInterface } from 'Type/FilmRatings.interface';

import { ContentSource } from './ContentSource';
import { UnifiedExternalId, UnifiedFilm } from './UnifiedFilm';

export interface SourceAdapter {
  readonly source: ContentSource;
  readonly name: string;
  getCollections?(page: number): Promise<{ items: ContentCollectionInterface[]; totalPages: number }>;
  getFilms?(link: string, page: number, options?: { deferMetadata?: boolean; onProgress?: (result: FilmListInterface) => void }): Promise<FilmListInterface>;

  /**
   * Returns the source-specific film page.
   *
   * Playback data belongs exclusively to the selected source.
   */
  getFilm(link: string, options?: { deferSeriesInfo?: boolean; background?: boolean; includeRelated?: boolean; includeSeriesInfo?: boolean }): Promise<FilmInterface | null>;

  /**
   * Load external ratings using the source-native film ID.
   */
  getFilmRatings?(filmId: string): Promise<FilmRatingsInterface>;

  /**
   * Search within this source.
   */
  search(query: string, page: number, options?: { background?: boolean; onProgress?: (result: FilmListInterface) => void }): Promise<FilmListInterface>;
  /** Lightweight candidates; callers must verify identity using full details. */
  searchCandidates?(query: string, page: number): Promise<FilmListInterface>;

  /**
   * Convert a source-specific film into the common catalog representation.
   */
  normalizeFilm(film: FilmInterface): UnifiedFilm;

  /**
   * Convert a source-specific catalog card into the common catalog representation.
   */
  normalizeFilmCard(film: FilmCardInterface): UnifiedFilm;

  /**
   * Extract external identifiers known by this source.
   */
  getExternalIds(film: FilmInterface): UnifiedExternalId[];
}