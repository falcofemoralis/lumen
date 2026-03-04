import ReactNativeApkInstallerModule from './ReactNativeApkInstallerModule';

class ReactNativeApkInstaller {
  install(filePath: string): Promise<string> {
    return ReactNativeApkInstallerModule.install(filePath);
  }

  haveUnknownAppSourcesPermission(): Promise<string> {
    return ReactNativeApkInstallerModule.haveUnknownAppSourcesPermission();
  }

  showUnknownAppSourcesPermission(): Promise<string> {
    return ReactNativeApkInstallerModule.showUnknownAppSourcesPermission();
  }
}

export const ApkInstaller = new ReactNativeApkInstaller();
