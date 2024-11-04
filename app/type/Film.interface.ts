import { FilmType } from './FilmType.type';

export default interface Film {
  // base
  id: string;
  link: string;
  type: FilmType;
  title: string;
  poster: string;
  year?: string;
  countries?: string[];
  genres?: string[];
  seriesInfo?: string;

  // additional
  largePoster?: string;
  ratings?: string[]; // type = rating + votes
  originalTitle?: string;
  description?: string;
  actors?: string[];
  directors?: string[];
  additionalInfo?: string[];

  // page info
  schedule?: string[];
  related?: string[];
  bookmarks?: string[];

  // stream
  series?: string[];
  translations?: string[];
  lastVoiceId?: string;
  lastSeason?: string;
  lastEpisode?: string;

  // flags
  isPendingRelease?: boolean;
}
