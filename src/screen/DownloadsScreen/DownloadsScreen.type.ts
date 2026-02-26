import { DownloadTask } from '@kesha-antonov/react-native-background-downloader';
import { DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

export interface DownloadsScreenComponentProps {
  downloadedFilms: DownloadFilmInterface[];
  isLoading: boolean;
  handleVideoSelect: (film: FilmInterface, video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  deleteFile: (task: DownloadTask) => void;
  restartTask: (task: DownloadTask) => void;
  deleteTask: (task: DownloadTask) => void;
  deleteFilm: (item: DownloadFilmInterface) => void;
  openFolder: (destination: string) => void;
  handleRefresh: (isRefresh: boolean) => Promise<void>;
}
