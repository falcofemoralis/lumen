import { NativeModule, requireOptionalNativeModule } from 'expo';

declare class ReactNativeWebCookiesModule extends NativeModule {
  getCookies(url: string): Promise<string>;
  clearCookies(): Promise<boolean>;
  getDefaultUserAgent(): Promise<string>;
  flush(): Promise<void>;
}

// Optional on purpose: JS can be ahead of the native build it runs on (a dev client, an
// app updated over the air), and a missing module has to leave the caller able to say
// "no cookies" rather than throw on import.
export default requireOptionalNativeModule<ReactNativeWebCookiesModule>('ReactNativeWebCookies');
