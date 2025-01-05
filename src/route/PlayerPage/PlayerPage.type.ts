import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

export interface PlayerPageComponentProps {
  video: FilmVideoInterface;
  film: FilmInterface;
  voice: FilmVoiceInterface;
}
