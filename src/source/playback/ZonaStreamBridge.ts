export interface ZonaStreamRequest {
  requestId: string;
  kinopoiskId: number;
  episodeKey: string | null;
}

export type ZonaStreamProviderRequest = Omit<
  ZonaStreamRequest,
  'requestId'
>;

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

type ZonaStreamHandler = (
  request: ZonaStreamProviderRequest,
) => Promise<ZonaRuntimeStream[]>;

let streamHandler: ZonaStreamHandler | null = null;

export const registerZonaStreamHandler = (
  handler: ZonaStreamHandler,
): (() => void) => {
  streamHandler = handler;

  return () => {
    if (streamHandler === handler) {
      streamHandler = null;
    }
  };
};

export const requestZonaStreams = async (
  request: ZonaStreamProviderRequest,
): Promise<ZonaRuntimeStream[]> => {
  if (!streamHandler) {
    throw new Error('Zona stream provider is not available');
  }

  return streamHandler(request);
};
