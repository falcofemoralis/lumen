import type { TorrentConnection } from './index';
type Bridge = { torrentStart(): Promise<TorrentConnection>; torrentStop(): Promise<void> };
const bridge = () => (globalThis as unknown as { lumen?: Bridge }).lumen;
export const startTorrentEngine = async (): Promise<TorrentConnection> => {
  const desktop = bridge();
  if (!desktop) throw new Error('Torrent playback requires the Windows or Android application.');

  return desktop.torrentStart();
};
export const stopTorrentEngine = async () => bridge()?.torrentStop();
