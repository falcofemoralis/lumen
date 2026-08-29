import { FilmCardInterface } from './FilmCard.interface';

export interface LocalCategoryInterface {
  id: string;
  title: string;
  filmIds: string[]; // newest first
  createdAt: number;
}

export interface LocalBookmarksBlob {
  categories: LocalCategoryInterface[];
  films: Record<string, FilmCardInterface>; // deduped across categories
}

export interface LocalHistoryItemInterface {
  id: string; // film id
  link: string;
  poster: string;
  title: string;
  voiceTitle?: string;
  seasonId?: string;
  episodeId?: string;
  updatedAt: number; // epoch ms, formatted at render
  isWatched: boolean;
}

// filmId -> scheduleItemId -> isWatched override
export type LocalScheduleMarks = Record<string, Record<string, boolean>>;
