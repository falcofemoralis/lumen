import type { ApiInterfaceConfig } from 'Api/type';
import type { DeviceConfigType } from 'src/config';

import { LocalCommentInterface } from './LocalComment.interface';
import { LocalBookmarksBlob } from './LocalLibrary.interface';
import { NotificationItemInterface } from './Notification.interface';

/**
 * What a backup file can carry. Each one is picked separately when exporting and
 * replaces whatever the device holds when importing. The settings are split the
 * same way the settings screen groups them, so a backup can be taken of the player
 * alone without dragging the interface and the network along with it.
 */
export enum BACKUP_SECTION {
  SETTINGS_APPEARANCE = 'settingsAppearance',
  SETTINGS_NETWORK = 'settingsNetwork',
  SETTINGS_DOWNLOADS = 'settingsDownloads',
  SETTINGS_PLAYER = 'settingsPlayer',
  SETTINGS_OTHER = 'settingsOther',
  BOOKMARKS = 'bookmarks',
  COMMENTS = 'comments',
  NOTIFICATIONS = 'notifications',
}

/**
 * One group of the settings screens, minus what belongs to this device or to the
 * account signed in on it -- see `DEVICE_CONFIG_KEYS`. Credentials, cookies and the
 * cached profile never leave the device.
 *
 * The same shape is used for every group; which of the optional keys are filled in
 * depends on which group it is -- see `CONFIG_KEY_SECTIONS`.
 */
export interface BackupSettingsInterface {
  /** the group's slice of the device config blob, the bulk of the settings screens */
  config: Partial<DeviceConfigType>;
  /** provider, CDN and useragent -- the Network group only */
  service?: Partial<ApiInterfaceConfig>;
  /** interface language, stored on its own -- the Appearance group only */
  language?: string;
  /** player quality, stored on its own -- the Player group only */
  playerQuality?: string;
}

export interface BackupDataInterface {
  [BACKUP_SECTION.SETTINGS_APPEARANCE]?: BackupSettingsInterface;
  [BACKUP_SECTION.SETTINGS_NETWORK]?: BackupSettingsInterface;
  [BACKUP_SECTION.SETTINGS_DOWNLOADS]?: BackupSettingsInterface;
  [BACKUP_SECTION.SETTINGS_PLAYER]?: BackupSettingsInterface;
  [BACKUP_SECTION.SETTINGS_OTHER]?: BackupSettingsInterface;
  [BACKUP_SECTION.BOOKMARKS]?: LocalBookmarksBlob;
  [BACKUP_SECTION.COMMENTS]?: LocalCommentInterface[];
  [BACKUP_SECTION.NOTIFICATIONS]?: NotificationItemInterface[];
}

export interface BackupFileInterface {
  /** guards against importing a JSON file that was never written by this app */
  app: string;
  /** format version of the file itself, not of the app that wrote it */
  version: number;
  appVersion?: string;
  createdAt: number;
  data: BackupDataInterface;
}
