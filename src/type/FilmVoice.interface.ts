import { FilmVideoInterface } from './FilmVideo.interface';

export interface EpisodeInterface {
  name: string;
  episodeId: string;
}

export interface SeasonInterface {
  name: string;
  seasonId: string;
  episodes: EpisodeInterface[];
}

export interface FilmVoiceInterface {
  id: string;
  title: string;
  img?: string;
  premiumIcon?: string;
  //
  seasons?: SeasonInterface[];
  video?: FilmVideoInterface;
  //
  isCamrip: string;
  isDirector: string;
  isAds: string;
  isPremium: boolean;
  //
  lastSeasonId?: string;
  lastEpisodeId?: string;
  //
  isActive: boolean;
}
