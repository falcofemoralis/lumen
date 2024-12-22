import { FilmType } from './FilmType.type';
import { FilmVoiceInterface } from './FilmVoice.interface';

export default interface FilmInterface {
  // base data
  id: string;
  link: string;
  type: FilmType;
  title: string;
  poster: string;

  // additional data
  originalTitle?: string;
  releaseDate?: string;
  countries?: string[];
  genres?: string[];
  seriesInfo?: string;
  largePoster?: string;
  ratings?: string[]; // type = rating + votes
  description?: string;
  actors?: string[];
  directors?: string[];
  additionalInfo?: string[];
  duration?: string;

  // collections data
  schedule?: string[];
  related?: string[];
  bookmarks?: string[];

  // player data
  voices: FilmVoiceInterface[];
  lastVoiceId?: string;
  hasVoices: boolean;
  hasSeasons: boolean;

  // onlyMovie; // voices[0] = {...video} hasSeasons: false hasVoices: false
  // onlyVoices; // voices[0,1,2] = {...}   hasSeasons: false hasVoices: true
  // onlySeasons; // voices[0] = {...}  hasSeasons: true hasVoices: false
  // voices+seasons; // voices[0,1,2] = {...}  hasSeasons: true hasVoices: true

  // flags
  isPendingRelease?: boolean;
}
