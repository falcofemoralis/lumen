import { NativeModule, requireNativeModule } from 'expo';

import { TvChannelInfo, TvChannelSpec } from './ReactNativeTvChannels';

declare class ReactNativeTvChannelsModule extends NativeModule {
  isSupported(): boolean;
  getChannels(): Promise<TvChannelInfo[]>;
  syncChannels(channels: TvChannelSpec[]): Promise<TvChannelInfo[]>;
  deleteChannelsExcept(providerIds: string[]): Promise<number>;
  requestChannelBrowsable(channelId: number): Promise<boolean>;
  scheduleBackgroundSync(intervalMinutes: number): Promise<boolean>;
  cancelBackgroundSync(): Promise<boolean>;
}

export default requireNativeModule<ReactNativeTvChannelsModule>('ReactNativeTvChannels');
