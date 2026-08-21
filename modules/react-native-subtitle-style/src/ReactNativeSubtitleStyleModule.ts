import { NativeModule, requireNativeModule } from 'expo';

import { SubtitleStyle } from './ReactNativeSubtitleStyle';

declare class ReactNativeSubtitleStyleModule extends NativeModule {
  setStyle(style: Partial<SubtitleStyle>): void;
  resetStyle(): void;
}

export default requireNativeModule<ReactNativeSubtitleStyleModule>('ReactNativeSubtitleStyle');
