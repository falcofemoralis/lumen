import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

export interface PlayerPageComponentProps {
  video: FilmVideoInterface;
  film: FilmInterface;
}
