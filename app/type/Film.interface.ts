import { FilmType } from './FilmType.type';
import { FilmVideo } from './FilmVideo.interface';
import { FilmVoice } from './FilmVoice.interface';

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

  // video
  video?: FilmVideo; // can be empty for series
  voices?: FilmVoice[]; // can be empty for movie
  lastVoiceId?: string;

  // flags
  isPendingRelease?: boolean;
}
