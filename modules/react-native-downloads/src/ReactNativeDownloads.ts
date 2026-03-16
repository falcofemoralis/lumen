import ReactNativeDownloadsModule from './ReactNativeDownloadsModule';

export interface DownloadDirectory {
  rootPath: string;
  downloadsPath: string;
  isRemovable: boolean;
  isPrimary: boolean;
}

class ReactNativeDownloads {
  getDownloadsDirectories(): DownloadDirectory[] {
    return ReactNativeDownloadsModule.getDownloadsDirectories();
  }

  getDefaultDownloadDirectory(): string | null {
    const directories = this.getDownloadsDirectories();

    return directories.find(dir => dir.isPrimary)?.downloadsPath || null;
  }
}

export const reactNativeDownloads = new ReactNativeDownloads();
