import { NativeModule, requireOptionalNativeModule } from 'expo';

import { CubicBezier } from './ReactNativeFocusScroll';

declare class ReactNativeFocusScrollModule extends NativeModule {
  scrollTo(viewTag: number, offset: number, duration: number, easing: CubicBezier): Promise<boolean>;
}

// Optional on purpose: JS can be ahead of the native build it runs on (a dev client, an
// app updated over the air), and a missing module has to leave the caller a way to scroll
// rather than throw on import.
export default requireOptionalNativeModule<ReactNativeFocusScrollModule>('ReactNativeFocusScroll');
