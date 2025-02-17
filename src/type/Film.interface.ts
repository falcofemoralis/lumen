import { ActorInterface } from './Actor.interface';
import { FilmCardInterface } from './FilmCard.interface';
import { FilmType } from './FilmType.type';
import { FilmVoiceInterface } from './FilmVoice.interface';
import { FranchiseItem } from './FranchiseItem.interface';
import { InfoListInterface } from './InfoList.interface';
import { RatingInterface } from './Rating.interface';
import { ScheduleInterface } from './Schedule.interface';

export interface FilmInterface {
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
  ratings?: RatingInterface[]; // type = rating + votes
  mainRating?: RatingInterface;
  ratingScale?: number;
  description?: string;
  actors?: ActorInterface[];
  directors?: ActorInterface[];
  additionalInfo?: string[];
  duration?: string;
  age?: string;

  // collections data
  schedule?: ScheduleInterface[];
  franchise?: FranchiseItem[];
  related?: FilmCardInterface[];
  bookmarks?: string[];
  includedIn?: InfoListInterface[];
  fromCollections?: InfoListInterface[];

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
