import { ApiInterface, ApiInterfaceConfig } from 'Api/type';
import { DEVICE_CONFIG } from 'Context/ConfigContext';
import { NOTIFICATIONS_STORAGE } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import { Directory, File } from 'expo-file-system';
import { getCurrentLanguage, isSupportedLanguage, LANGUAGE_STORAGE_KEY } from 'i18n/index';
import { defaultConfig, DeviceConfigType } from 'src/config';
import {
  BACKUP_SECTION,
  BackupDataInterface,
  BackupFileInterface,
  BackupSettingsInterface,
} from 'Type/Backup.interface';
import { NotificationItemInterface } from 'Type/Notification.interface';
import { getLocalComments, LOCAL_COMMENTS_KEY } from 'Util/LocalComments';
import { getLocalBookmarks, LOCAL_BOOKMARKS_KEY } from 'Util/LocalLibrary';
import { getPlayerQuality, updatePlayerQuality } from 'Util/Player';
import { storage } from 'Util/Storage';

import {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  BACKUP_MIME_TYPE,
  buildBackupFileName,
  getSectionConfigKeys,
  getSectionsConfigKeys,
  isSettingsSection,
  mergeConfig,
  parseBackupFile,
  sanitizeBookmarks,
  sanitizeComments,
  sanitizeConfig,
  sanitizeNotifications,
  sanitizeServiceConfig,
  SERVICE_CONFIG_KEYS,
  SETTINGS_SECTIONS,
  SettingsSection,
} from './logic';

export { formatBackupSections, getBackupSectionTitle } from './labels';
export {
  BACKUP_SECTIONS,
  buildBackupFileName,
  getBackupSections,
  isSettingsSection,
  parseBackupFile,
  SETTINGS_SECTIONS,
} from './logic';

export type BackupWriteResult =
  | { status: 'cancelled' }
  | { status: 'ok'; fileName: string };

export type BackupReadResult =
  | { status: 'cancelled' }
  | { status: 'invalid' }
  | { status: 'ok'; backup: BackupFileInterface };

// what the file system module throws when the user backs out of the system picker,
// as opposed to the picker itself failing to open
const PICKER_CANCELLED_CODE = 'ERR_PICKER_CANCELLED';

// json files handed around between devices are not always reported as such by the
// provider that serves them, so the picker is opened for what they are mistaken for too
const BACKUP_PICKER_MIME_TYPES = [BACKUP_MIME_TYPE, 'text/plain', 'application/octet-stream'];

const isPickerCancelled = (error: unknown): boolean => (
  !!error && typeof error === 'object' && (error as { code?: string }).code === PICKER_CANCELLED_CODE
);

/**
 * The stored config over the defaults, the same way the config context reads it -- a
 * blob written by an older build is missing whatever keys were added since.
 */
const getStoredConfig = (): DeviceConfigType => ({
  ...defaultConfig,
  ...(storage.getConfigStorage().load<DeviceConfigType>(DEVICE_CONFIG) ?? {}),
});

const getStoredNotifications = (): NotificationItemInterface[] => (
  storage.getMiscStorage().load<NotificationItemInterface[]>(NOTIFICATIONS_STORAGE) ?? []
);

/**
 * One settings group: its slice of the config blob, plus whichever of the settings
 * that are stored on their own belong to that group.
 */
const collectSettings = (
  section: SettingsSection,
  service: ApiInterface
): BackupSettingsInterface => {
  const settings: BackupSettingsInterface = {
    config: sanitizeConfig(getStoredConfig(), defaultConfig, getSectionConfigKeys(section)),
  };

  if (section === BACKUP_SECTION.SETTINGS_NETWORK) {
    const serviceConfig = SERVICE_CONFIG_KEYS.reduce((acc: Record<string, unknown>, key) => {
      acc[key] = service.getConfig(key);

      return acc;
    }, {});

    settings.service = sanitizeServiceConfig(serviceConfig);
  }

  if (section === BACKUP_SECTION.SETTINGS_APPEARANCE) {
    settings.language = getCurrentLanguage();
  }

  if (section === BACKUP_SECTION.SETTINGS_PLAYER) {
    settings.playerQuality = getPlayerQuality();
  }

  return settings;
};

const collectSection = (section: BACKUP_SECTION, service: ApiInterface): BackupDataInterface => {
  if (isSettingsSection(section)) {
    return { [section]: collectSettings(section, service) };
  }

  switch (section) {
    case BACKUP_SECTION.BOOKMARKS:
      return { [BACKUP_SECTION.BOOKMARKS]: getLocalBookmarks() };
    case BACKUP_SECTION.COMMENTS:
      return { [BACKUP_SECTION.COMMENTS]: getLocalComments() };
    case BACKUP_SECTION.NOTIFICATIONS:
      return { [BACKUP_SECTION.NOTIFICATIONS]: getStoredNotifications() };
    default:
      return {};
  }
};

export const collectBackup = (
  sections: BACKUP_SECTION[],
  service: ApiInterface
): BackupFileInterface => ({
  app: BACKUP_APP_ID,
  version: BACKUP_FORMAT_VERSION,
  appVersion: Application.nativeApplicationVersion ?? undefined,
  createdAt: Date.now(),
  data: sections.reduce((acc: BackupDataInterface, section) => ({
    ...acc,
    ...collectSection(section, service),
  }), {}),
});

/**
 * Writes the imported settings straight to storage rather than through the config
 * context: the blob is replaced in one go, and the in-memory copies the app keeps
 * (`getGlobalConfig`, the service's config, i18next's active language) are only rebuilt
 * on start -- which is why an import asks for a restart.
 *
 * All of the imported groups are written at once, so the blob is read and saved once
 * however many of them the file carries, and only the keys of those groups are touched.
 */
const applySettings = (
  data: BackupDataInterface,
  sections: SettingsSection[],
  service: ApiInterface
) => {
  // each group is sanitized against its own keys, so what is stored under one of them
  // can only ever land in the settings that group is made of
  const config = sections.reduce((acc: Record<string, unknown>, section) => ({
    ...acc,
    ...sanitizeConfig(data[section]?.config, defaultConfig, getSectionConfigKeys(section)),
  }), {});

  storage.getConfigStorage().save(
    DEVICE_CONFIG,
    mergeConfig(getStoredConfig(), config, defaultConfig, getSectionsConfigKeys(sections))
  );

  const { service: serviceConfig } = data[BACKUP_SECTION.SETTINGS_NETWORK] ?? {};

  Object.entries(sanitizeServiceConfig(serviceConfig)).forEach(([key, value]) => {
    service.setConfig(key as keyof ApiInterfaceConfig, value);
  });

  const { language } = data[BACKUP_SECTION.SETTINGS_APPEARANCE] ?? {};

  if (language && isSupportedLanguage(language)) {
    storage.getConfigStorage().saveString(LANGUAGE_STORAGE_KEY, language);
  }

  const { playerQuality } = data[BACKUP_SECTION.SETTINGS_PLAYER] ?? {};

  if (playerQuality) {
    updatePlayerQuality(playerQuality);
  }
};

/**
 * Replaces what the device holds with the file's contents, section by section. Anything
 * malformed is dropped on the way in -- the file was picked by the user and lands in the
 * storage the whole app reads.
 *
 * @returns the sections that were actually applied.
 */
export const applyBackup = (data: BackupDataInterface, service: ApiInterface): BACKUP_SECTION[] => {
  const applied: BACKUP_SECTION[] = [];

  const settingsSections = SETTINGS_SECTIONS.filter((section) => !!data[section]);

  if (settingsSections.length) {
    applySettings(data, settingsSections, service);
    applied.push(...settingsSections);
  }

  const bookmarks = sanitizeBookmarks(data[BACKUP_SECTION.BOOKMARKS]);

  if (bookmarks) {
    storage.getLocalLibraryStorage().save(LOCAL_BOOKMARKS_KEY, bookmarks);
    applied.push(BACKUP_SECTION.BOOKMARKS);
  }

  if (data[BACKUP_SECTION.COMMENTS]) {
    storage.getCommentsStorage().save(
      LOCAL_COMMENTS_KEY,
      sanitizeComments(data[BACKUP_SECTION.COMMENTS])
    );
    applied.push(BACKUP_SECTION.COMMENTS);
  }

  if (data[BACKUP_SECTION.NOTIFICATIONS]) {
    storage.getMiscStorage().save(
      NOTIFICATIONS_STORAGE,
      sanitizeNotifications(data[BACKUP_SECTION.NOTIFICATIONS])
    );
    applied.push(BACKUP_SECTION.NOTIFICATIONS);
  }

  return applied;
};

/**
 * How many entries a section holds, for the counts shown next to it while exporting,
 * or `undefined` for the settings groups -- there is nothing there to count.
 */
export const countBackupSection = (section: BACKUP_SECTION): number | undefined => {
  switch (section) {
    // the films, not the entries: one bookmarked in two categories is still one film
    case BACKUP_SECTION.BOOKMARKS:
      return Object.keys(getLocalBookmarks().films).length;
    case BACKUP_SECTION.COMMENTS:
      return getLocalComments().length;
    case BACKUP_SECTION.NOTIFICATIONS:
      return getStoredNotifications().length;
    default:
      return undefined;
  }
};

/**
 * What to call the file that was just written. The directory the user picked is a SAF
 * tree, so the file's URI ends in an encoded document id rather than in a name -- the
 * decoded tail is used when it still looks like the file that was asked for (android
 * numbers a name that is already taken), and the requested name otherwise.
 */
const resolveSavedName = (uri: string, requestedName: string): string => {
  try {
    const tail = decodeURIComponent(uri).split(/[/:]/).pop() ?? '';

    return tail.toLowerCase().endsWith('.json') ? tail : requestedName;
  } catch {
    return requestedName;
  }
};

/**
 * Asks for a directory with the system picker and writes the backup into it.
 */
export const exportBackup = async (
  sections: BACKUP_SECTION[],
  service: ApiInterface
): Promise<BackupWriteResult> => {
  const backup = collectBackup(sections, service);

  let directory: Directory;

  try {
    directory = await Directory.pickDirectoryAsync();
  } catch (error) {
    if (isPickerCancelled(error)) {
      return { status: 'cancelled' };
    }

    throw error;
  }

  const requestedName = buildBackupFileName(new Date());
  const file = directory.createFile(requestedName, BACKUP_MIME_TYPE);

  file.write(JSON.stringify(backup, null, 2));

  return { status: 'ok', fileName: resolveSavedName(file.uri, requestedName) };
};

/**
 * Asks for a file with the system picker and reads a backup out of it.
 */
export const readBackup = async (): Promise<BackupReadResult> => {
  const picked = await File.pickFileAsync({ mimeTypes: BACKUP_PICKER_MIME_TYPES });

  if (picked.canceled) {
    return { status: 'cancelled' };
  }

  const backup = parseBackupFile(await picked.result.text());

  if (!backup) {
    return { status: 'invalid' };
  }

  return { status: 'ok', backup };
};
