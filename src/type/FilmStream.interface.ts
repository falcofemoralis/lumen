export interface FilmStreamInterface {
  url: string;
  downloadUrl?: string;
  quality: string;
  headers?: Record<string, string>;
}
