export interface ScheduleItemInterface {
  id: string;
  name: string;
  episodeName: string;
  episodeNameOriginal?: string;
  date: string;
  releaseDate?: string;
  isReleased?: boolean;
  isWatched?: boolean;
}
