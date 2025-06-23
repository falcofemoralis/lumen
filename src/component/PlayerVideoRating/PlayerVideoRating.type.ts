import { FilmInterface } from 'Type/Film.interface';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';

export type PlayerVideoRatingContainerProps = {
  film: FilmInterface;
  seasons: SeasonInterface[];
  episodes: EpisodeInterface[];
};

export type PlayerVideoRatingComponentProps = {
  film: FilmInterface;
  seasons: SeasonInterface[];
  episodes: EpisodeInterface[];
};