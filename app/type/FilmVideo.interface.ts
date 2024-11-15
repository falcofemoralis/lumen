export interface FilmVideoStream {
  url: string;
  quality: string;
}

export interface FilmVideo {
  streams: FilmVideoStream[];
  subtitles?: string[];
  thumbnails?: string[];
}
