import { SubtitleInterface } from './FilmVideo.interface';
import { FilmVoiceInterface } from './FilmVoice.interface';

export interface DownloadLinkInterface {
  url: string;
  quality: string;
  headers?: Record<string, string>;
  subtitles?: SubtitleInterface[];
  seasonId?: string;
  episodeId?: string;
  voice?: FilmVoiceInterface | null;
}