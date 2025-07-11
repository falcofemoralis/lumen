import RNApkInstaller from '@dominicvonk/react-native-apk-installer';
import t from 'i18n/t';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { wait } from 'Util/Misc';

export class Installer {
  private static readonly DOWNLOAD_TIMEOUT = 300000;
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
      const grantedStorage = await this.requestStoragePermission();
      if (!grantedStorage) {
        Alert.alert(t('Error'), t('Storage permission is required to download APK'));

        return false;
      }

      const grantedInstall = await RNApkInstaller.haveUnknownAppSourcesPermission();
      if (!grantedInstall) {
        RNApkInstaller.showUnknownAppSourcesPermission();

        return false;
      }

      const apkPath = await Promise.race([
        this.downloadApk(url, onProgress),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Download timeout')), this.DOWNLOAD_TIMEOUT)),
      ]);

      if (onProgress) {
        onProgress(100, 100); // Ensure progress is set to 100% on completion
      }

      await wait(1000); // Wait a bit to ensure the download is complete before installing

      return this.installApk(apkPath);
    } catch (error) {
      console.error('APK installation failed:', error);
      const errorMessage = (error as Error).message;

      if (errorMessage.includes('timeout')) {
        Alert.alert('Error', 'Download timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', `Failed to install APK: ${errorMessage}`);
      }

      return false;
    }
  }

  private static async requestStoragePermission(): Promise<boolean> {
    try {
      const androidVersion = Number(Platform.Version);

      // For different Android versions, we need different permissions
      if (androidVersion >= 33) {
        // Android 13+ (API 33+) - Scoped storage, but Downloads folder should be accessible
        return true; // Downloads folder is generally accessible without special permissions
      }

      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: t('Storage Permission Required'),
            message: t('This app needs storage access to download updates to your Downloads folder.'),
            buttonNeutral: t('Ask Me Later'),
            buttonNegative: t('Cancel'),
            buttonPositive: t('OK'),
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        console.error('Storage permission request failed, but Downloads folder might still be accessible');

        return true;
      }
    } catch (error) {
      console.error('Permission request failed:', error);

      // if permission request fails, we can still try to proceed
      // as Downloads folder might still be accessible
      return true;
    }
  }

  private static async downloadApk(
    url: string,
    onProgress?: (received: number, total: number) => void
  ): Promise<string> {
    const { fs } = ReactNativeBlobUtil;

    const filePath = `${fs.dirs.DownloadDir}/${Installer.APK_NAME}`;

    try {
      const dirExists = await fs.exists(fs.dirs.DownloadDir);
      if (!dirExists) {
        await fs.mkdir(fs.dirs.DownloadDir);
      }
    } catch (dirError) {
      console.error('Could not create Downloads directory, but continuing anyway:', dirError);
    }

    const previousFileExists = await fs.exists(filePath);
    if (previousFileExists) {
      await fs.unlink(filePath);
    }

    try {
      const response = await ReactNativeBlobUtil.config({
        path: filePath,
        fileCache: true,
      })
        .fetch('GET', url)
        .progress((received, total) => {
          if (onProgress && Number(total) > 0) {
            const receivedNum = Number(received);
            const totalNum = Number(total);
            onProgress(receivedNum, totalNum);
          }
        });

      const statusCode = response.info().status;
      if (statusCode !== 200) {
        console.error('Response info:', response.info());
        throw new Error(`Download failed with status code: ${statusCode}`);
      }

      const downloadedPath = response.path();

      const exists = await fs.exists(downloadedPath);
      if (!exists) {
        throw new Error('Downloaded file does not exist');
      }

      const stats = await fs.stat(downloadedPath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      return downloadedPath;
    } catch (error) {
      console.error('Download failed:', error);

      // Fallback to download manager which should handle Downloads folder correctly
      const fallbackResponse = await ReactNativeBlobUtil.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: 'Downloading Lumen Update',
          description: 'Downloading the latest version...',
          mime: 'application/vnd.android.package-archive',
          mediaScannable: true, // Make it visible in Downloads folder
        },
      }).fetch('GET', url);

      const statusCode = fallbackResponse.info().status;
      if (statusCode !== 200) {
        console.error('Fallback response info:', fallbackResponse.info());
        throw new Error(`Fallback download failed with status code: ${statusCode}`);
      }

      return fallbackResponse.path();
    }
  }

  private static async installApk(apkPath: string): Promise<boolean> {
    try {
      const { fs } = ReactNativeBlobUtil;
      const exists = await fs.exists(apkPath);

      if (!exists) {
        throw new Error('APK file not found');
      }

      await RNApkInstaller.install(apkPath);

      return false;
    } catch (error) {
      console.error('APK installation failed:', error);

      return false;
    }
  }
}
