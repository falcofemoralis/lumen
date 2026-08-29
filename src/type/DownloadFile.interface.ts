import { DownloadTask } from '@kesha-antonov/react-native-background-downloader';

import { FilmInterface } from './Film.interface';
import { SubtitleInterface } from './FilmVideo.interface';

export interface DownloadFileInterface {
  id: string; // uuid
  url: string;
  destination: string;
  folder: string;
  film: Pick<FilmInterface,
    'id' |
    'link' |
    'type' |
    'poster' | // should be local path to file
    'title' |
    'originalTitle' |
    'releaseDate' |
    'countries' |
    'genres' |
    'voices' |
    'hasVoices' |
    'hasSeasons'
  >;
  quality: string;
  subtitles?: SubtitleInterface[];
  seasonId?: string;
  episodeId?: string;
  voiceId?: string;
  bytesTotal?: number | null;
  // Set while the file is being downloaded and cleared once it completes, so a
  // half written file left behind by a failed download is never offered for
  // playback. Absent on entries written before this flag existed -- those are all
  // completed downloads, since a failure used to delete its file.
  isPartial?: boolean;
  task?: DownloadTask;
}

export interface DownloadFilmInterface extends Omit<DownloadFileInterface,
  'url' |
  'quality' |
  'seasonId' |
  'episodeId' |
  'voiceId' |
  'task'
> {
  tasks: DownloadTask[];
}
