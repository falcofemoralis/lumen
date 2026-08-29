import {
  completeHandler,
  createDownloadTask,
  directories,
} from '@kesha-antonov/react-native-background-downloader';
import { File } from 'expo-file-system';
import { t } from 'i18n/translate';
import { ApkInstaller } from 'Modules/react-native-apk-installer';
import { Alert, Platform } from 'react-native';
import { wait } from 'Util/Misc';

export class Installer {
  // the download is aborted when it makes no progress at all for this long,
  // instead of capping the total time — a big APK over a slow TV connection
  // is legitimately slow, a dead socket is not
  private static readonly STALL_TIMEOUT = 60000;
  private static readonly APK_NAME = 'lumen-update.apk';

  static async downloadAndInstallApk(
    url: string,
    onProgress?: (received: number, total: number) => void
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      Alert.alert(t('Error'), t('APK installation is only supported on Android'));

      return false;
    }

    try {
      const grantedInstall = await ApkInstaller.haveUnknownAppSourcesPermission();
      if (!grantedInstall) {
        ApkInstaller.showUnknownAppSourcesPermission();

        return false;
      }

      const apkPath = await this.downloadApk(url, onProgress);

      if (onProgress) {
        onProgress(100, 100); // Ensure progress is set to 100% on completion
      }

      await wait(1000); // Wait a bit to ensure the download is complete before installing

      return this.installApk(apkPath);
    } catch (error) {
      const errorMessage = (error as Error).message;

      if (errorMessage.includes('timeout')) {
        Alert.alert('Error', 'Download timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', `Failed to install APK: ${errorMessage}`);
      }

      return false;
    }
  }

  // The system installer keeps reading the APK after `install()` returns - the
  // copy into the install session happens once the user confirms the dialog -
  // so the file cannot be dropped right after the intent is fired. It is
  // removed on the next launch instead: by then the install has either gone
  // through (this very launch is the new build) or been cancelled.
  static cleanupApk(): void {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const file = Installer.getApkFile();

      if (file.exists) {
        file.delete();
      }
    } catch {
      // a stale APK only costs disk space, and the next download replaces it
    }
  }

  // app-private storage: needs no runtime permission and is exposed through
  // the installer's FileProvider (`files-path`), so the install intent can
  // still read the APK back
  private static getApkPath(): string {
    return `${directories.documents}/${Installer.APK_NAME}`;
  }

  private static getApkFile(): File {
    return new File(`file://${Installer.getApkPath()}`);
  }

  private static downloadApk(
    url: string,
    onProgress?: (received: number, total: number) => void
  ): Promise<string> {
    const filePath = Installer.getApkPath();

    // a leftover file from an interrupted attempt would be resumed rather than
    // re-downloaded, which produces a corrupt APK once the update URL changes
    const previousFile = Installer.getApkFile();

    if (previousFile.exists) {
      previousFile.delete();
    }

    return new Promise<string>((resolve, reject) => {
      const task = createDownloadTask({
        id: `app-update-${Date.now()}`,
        url,
        destination: filePath,
      });

      let stallTimer: ReturnType<typeof setTimeout> | undefined;
      let isSettled = false;

      const settle = (action: () => void) => {
        if (isSettled) {
          return;
        }

        isSettled = true;

        if (stallTimer) {
          clearTimeout(stallTimer);
        }

        action();
      };

      const watchStall = () => {
        if (stallTimer) {
          clearTimeout(stallTimer);
        }

        stallTimer = setTimeout(() => {
          task.stop();
          settle(() => reject(new Error('Download timeout')));
        }, Installer.STALL_TIMEOUT);
      };

      task
        .begin(() => {
          watchStall();
        })
        .progress(({ bytesDownloaded, bytesTotal }) => {
          watchStall();

          if (onProgress && bytesTotal > 0) {
            onProgress(bytesDownloaded, bytesTotal);
          }
        })
        .done(({ location }) => {
          completeHandler(task.id);
          settle(() => resolve(location || filePath));
        })
        .error(({ error }) => {
          completeHandler(task.id);
          settle(() => reject(new Error(error || 'Download failed')));
        });

      watchStall();
      task.start();
    });
  }

  private static async installApk(apkPath: string): Promise<boolean> {
    try {
      // `apkPath` is a plain path — ApkInstaller resolves it with java.io.File
      if (!new File(`file://${apkPath}`).exists) {
        throw new Error('APK file not found');
      }

      await ApkInstaller.install(apkPath);

      return false;
    } catch (error) {
      console.error(error);

      return false;
    }
  }
}
