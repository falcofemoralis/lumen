import { FilmType } from './FilmType.type';
import { FilmVoice } from './FilmVoice.interface';

export default interface Film {
  // base data
  id: string;
  link: string;
  type: FilmType;
  title: string;
  poster: string;
  year?: string;
  countries?: string[];
  genres?: string[];
  seriesInfo?: string;

  // additional data
  largePoster?: string;
  ratings?: string[]; // type = rating + votes
  originalTitle?: string;
  description?: string;
  actors?: string[];
  directors?: string[];
  additionalInfo?: string[];

  // collections data
  schedule?: string[];
  related?: string[];
  bookmarks?: string[];

  // player data
  voices: FilmVoice[];
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
