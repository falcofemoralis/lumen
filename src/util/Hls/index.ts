import { File, Paths } from 'expo-file-system';
import { FilmStreamInterface } from 'Type/FilmStream.interface';

const PARAMS_MAP: Record<string, string> = {
  '4k': 'BANDWIDTH=9000000,RESOLUTION=3840x2160',
  '2k': 'BANDWIDTH=4500000,RESOLUTION=2560x1440',
  '1080p Ultra': 'BANDWIDTH=4000000,RESOLUTION=1920x1080',
  '1080p': 'BANDWIDTH=2000000,RESOLUTION=1280x720',
  '720p': 'BANDWIDTH=900000,RESOLUTION=854x480',
  '480p': 'BANDWIDTH=800000,RESOLUTION=640x460',
  '360p': 'BANDWIDTH=500000,RESOLUTION=480x360',
};

export const createMasterPlaylist = (streams: FilmStreamInterface[]) => {
  let master = '#EXTM3U\n\n';

  streams.forEach(q => {
    const params = PARAMS_MAP[q.quality];
    if (!params) {
      return;
    }

    master += `#EXT-X-STREAM-INF:${params}\n${q.url}\n\n`;
  });

  const file = new File(Paths.cache, 'master.m3u8');

  file.write(master);

  return { uri: file.uri };
};

export const getQualityFromResolution = (width: number, height: number) => {
  const item = Object.entries(PARAMS_MAP).find(([_, value]) => {
    if (value.includes(`RESOLUTION=${width}x${height}`)) {
      return true;
    }

    return false;
  });

  return item?.[0] ?? '-';
};

const mimeTypeToCodec: Record<string, string> = {
  'video/avc': 'AVC', // H.264
  'video/h264': 'AVC', // alternative H.264 MIME
  'video/hevc': 'HEVC', // H.265
  'video/h265': 'HEVC', // alternative H.265 MIME
  'video/vp8': 'VP8',
  'video/vp9': 'VP9',
  'video/av1': 'AV1',
  'video/mpeg': 'MPEG',
  'video/mp4': 'MP4',
  'video/webm': 'WebM',
  'video/quicktime': 'QuickTime',
};

export const getCodecName = (mimeType: string): string => {
  return mimeTypeToCodec[mimeType.toLowerCase()] || mimeType;
};