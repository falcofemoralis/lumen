export const PROGRESS_THRESHOLD_MIN = 3;
export const PROGRESS_THRESHOLD_MAX = 3;

export const formatDownloadKey = (seasonId: string | number | undefined, episodeId: string | number | undefined) =>
  `${seasonId ?? ''},${episodeId ?? ''}`;