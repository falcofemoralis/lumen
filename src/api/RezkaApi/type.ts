export interface JSONResult {
  success: boolean;
  message: string;
}

export type CommentsResult = {
  comments: string
  last_update_id: string,
  navigation: string,
};

export type SubtitleLns = {
  [key: string]: string;
};

export type StreamsResult = JSONResult & {
  url: string
  thumbnails: string,
  subtitle: string,
  subtitle_def: string,
  subtitle_lns: SubtitleLns
};

export type SeasonsResult = JSONResult & {
  seasons: string;
  episodes: string
};

export enum FILM_SORTING {
  ALL = 'all',
  FILMS = 'films',
  SERIES = 'series',
  MULFILMS = 'mulfilms',
  ANIME = 'anime',
}

export type TrailerResult = JSONResult & {
  code: string;
}

export type RatingResult = JSONResult & {
  num: number;
  votes: number;
};

export type LikeResult = JSONResult & {
  count: number;
  type: 'minus' | 'plus';
};