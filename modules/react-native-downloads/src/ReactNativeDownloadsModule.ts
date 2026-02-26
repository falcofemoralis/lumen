import { NativeModule, requireNativeModule } from 'expo';

import { DownloadDirectory } from './ReactNativeDownloads';

declare class ReactNativeDownloadsModule extends NativeModule {
  getDownloadsDirectories(): DownloadDirectory[];
}

export default requireNativeModule<ReactNativeDownloadsModule>('ReactNativeDownloads');
