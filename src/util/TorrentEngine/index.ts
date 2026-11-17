import { requireOptionalNativeModule } from 'expo';

export interface TorrentConnection { baseUrl: string; authorization: string; hls: boolean }
type EngineModule = { start(): Promise<TorrentConnection>; stop(): Promise<void> };
const native = requireOptionalNativeModule<EngineModule>('LumenTorrent');
export const startTorrentEngine = async (): Promise<TorrentConnection> => {
  if (!native) throw new Error('Torrent engine is missing. Install a new Android build.');

  return native.start();
};
export const stopTorrentEngine = async () => native?.stop();
