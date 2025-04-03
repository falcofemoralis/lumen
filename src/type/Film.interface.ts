import { ActorCardInterface } from './ActorCard.interface';
import { BookmarkInterface } from './Bookmark.interface';
import { CollectionItemInterface } from './CollectionItem';
import { FilmCardInterface } from './FilmCard.interface';
import { FilmType } from './FilmType.type';
import { FilmVoiceInterface } from './FilmVoice.interface';
import { FranchiseItem } from './FranchiseItem.interface';
import { InfoListInterface } from './InfoList.interface';
import { RatingInterface } from './Rating.interface';
import { ScheduleInterface } from './Schedule.interface';
import { VoiceRatingInterface } from './VoiceRating.interface';

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
  countries?: CollectionItemInterface[];
  genres?: CollectionItemInterface[];
  seriesInfo?: string;
  largePoster?: string;
  ratings?: RatingInterface[]; // type = rating + votes
  mainRating?: RatingInterface;
  ratingScale?: number;
  description?: string;
  actors?: ActorCardInterface[];
  directors?: ActorCardInterface[];
  additionalInfo?: string[];
  duration?: string;
  age?: string;

  // collections data
  schedule?: ScheduleInterface[];
  franchise?: FranchiseItem[];
  related?: FilmCardInterface[];
  bookmarks?: BookmarkInterface[];
  includedIn?: InfoListInterface[];
  fromCollections?: InfoListInterface[];
  voiceRating?: VoiceRatingInterface[];

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
