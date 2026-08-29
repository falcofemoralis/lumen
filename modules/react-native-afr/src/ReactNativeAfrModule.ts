import { NativeModule, requireNativeModule } from 'expo';

import { AfrDisplayMode, AfrStatus } from './ReactNativeAfr';

declare class ReactNativeAfrModule extends NativeModule {
  isSupported(): boolean;
  setEnabled(isEnabled: boolean): void;
  getStatus(): AfrStatus;
  getDisplayModes(): AfrDisplayMode[];
}

export default requireNativeModule<ReactNativeAfrModule>('ReactNativeAfr');
