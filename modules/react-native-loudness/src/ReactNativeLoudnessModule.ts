import { NativeModule, requireNativeModule } from 'expo';

import { LoudnessStatus, LoudnessStrength } from './ReactNativeLoudness';

declare class ReactNativeLoudnessModule extends NativeModule {
  isSupported(): boolean;
  setStrength(strength: LoudnessStrength): void;
  getStatus(): LoudnessStatus;
}

export default requireNativeModule<ReactNativeLoudnessModule>('ReactNativeLoudness');
