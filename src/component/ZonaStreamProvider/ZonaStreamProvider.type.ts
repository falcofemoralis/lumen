export interface ZonaStreamRequest {
  requestId: string;
  kinopoiskId: number;
  episodeKey: string | null;
}

export interface ZonaRuntimeStream {
  source: {
    url: string;
    headers: Record<string, string>;
  };
  translation: string;
  language: string;
  resolution: string;
  quality: string;
  isTrailer: boolean;
  subtitles: Array<Record<string, unknown>>;
  parameters: Record<string, unknown>;
}

export interface ZonaStreamProviderRequest {
  kinopoiskId: number;
  episodeKey: string | null;
}

export interface ZonaStreamProviderProps {
  onReadyChange?: (ready: boolean) => void;
}
