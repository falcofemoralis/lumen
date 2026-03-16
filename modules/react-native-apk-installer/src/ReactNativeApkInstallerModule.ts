import { NativeModule, requireNativeModule } from 'expo';

declare class ReactNativeApkInstallerModule extends NativeModule {
  install(filePath: string): Promise<string>;
  haveUnknownAppSourcesPermission(): Promise<string>;
  showUnknownAppSourcesPermission(): Promise<string>;
}

export default requireNativeModule<ReactNativeApkInstallerModule>('ReactNativeApkInstaller');
