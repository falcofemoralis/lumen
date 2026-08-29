import type { ApiInterfaceConfig } from 'Api/type';
import { CONFIG_KEY_SECTIONS, type DeviceConfigType } from 'src/config';
import {
  BACKUP_SECTION,
  BackupDataInterface,
  BackupFileInterface,
} from 'Type/Backup.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { LocalCommentInterface } from 'Type/LocalComment.interface';
import { LocalBookmarksBlob, LocalCategoryInterface } from 'Type/LocalLibrary.interface';
import { NotificationItemInterface } from 'Type/Notification.interface';
import { safeJsonParse } from 'Util/Json';

/** Stamped into every file and checked on import -- a JSON file from anywhere else is refused. */
export const BACKUP_APP_ID = 'lumen';

/** Bumped only when the shape of the file changes; a newer file is refused by an older build. */
export const BACKUP_FORMAT_VERSION = 1;

export const BACKUP_MIME_TYPE = 'application/json';

export const BACKUP_FILE_PREFIX = 'lumen-backup';

/** The settings groups, in the order the settings screen lists them. */
export const SETTINGS_SECTIONS = [
  BACKUP_SECTION.SETTINGS_APPEARANCE,
  BACKUP_SECTION.SETTINGS_NETWORK,
  BACKUP_SECTION.SETTINGS_DOWNLOADS,
  BACKUP_SECTION.SETTINGS_PLAYER,
  BACKUP_SECTION.SETTINGS_OTHER,
] as const;

export type SettingsSection = typeof SETTINGS_SECTIONS[number];

export const BACKUP_SECTIONS = [
  ...SETTINGS_SECTIONS,
  BACKUP_SECTION.BOOKMARKS,
  BACKUP_SECTION.COMMENTS,
  BACKUP_SECTION.NOTIFICATIONS,
];

export const isSettingsSection = (section: BACKUP_SECTION): section is SettingsSection => (
  (SETTINGS_SECTIONS as readonly BACKUP_SECTION[]).includes(section)
);

/**
 * Config keys that describe THIS device rather than the user's preferences. They are
 * never written to a backup and never taken from one: `isTV` decides which whole UI
 * the app builds, `isConfigured` is the welcome flow's own state, `securedSettings`
 * is unlocked per device, and `downloadsPath` names a directory that only exists on
 * the device it was picked on.
 */
export const DEVICE_CONFIG_KEYS = [
  'isTV',
  'isConfigured',
  'securedSettings',
  'downloadsPath',
] as const satisfies readonly (keyof DeviceConfigType)[];

/** Every config key a backup may carry -- the blob minus the keys above. */
export type BackupConfigKey = Exclude<keyof DeviceConfigType, typeof DEVICE_CONFIG_KEYS[number]>;

const CONFIG_KEYS = Object.keys(CONFIG_KEY_SECTIONS) as BackupConfigKey[];

/** The config keys one settings group is made of. */
export const getSectionConfigKeys = (section: SettingsSection): BackupConfigKey[] => (
  CONFIG_KEYS.filter((key) => CONFIG_KEY_SECTIONS[key] === section)
);

/** Every config key the given groups are made of, with nothing counted twice. */
export const getSectionsConfigKeys = (sections: readonly SettingsSection[]): BackupConfigKey[] => (
  CONFIG_KEYS.filter((key) => sections.includes(CONFIG_KEY_SECTIONS[key]))
);

/**
 * The types of the config keys whose default is `undefined` -- there is no default
 * value to compare an imported one against, so they are spelled out.
 */
const OPTIONAL_CONFIG_TYPES: Record<string, string> = {
  themeScheme: 'string',
  playerBufferTimeSetting: 'number',
};

const SERVICE_CONFIG_TYPES = {
  provider: 'string',
  cdn: 'string',
  autoCdn: 'boolean',
  userAgentNew: 'string',
  officialMode: 'string',
  officialModeShareLink: 'string',
} satisfies Record<keyof ApiInterfaceConfig, string>;

export const SERVICE_CONFIG_KEYS = Object.keys(SERVICE_CONFIG_TYPES) as (keyof ApiInterfaceConfig)[];

const isRecord = (value: unknown): value is Record<string, unknown> => (
  !!value && typeof value === 'object' && !Array.isArray(value)
);

const isDeviceConfigKey = (key: string): boolean => (
  (DEVICE_CONFIG_KEYS as readonly string[]).includes(key)
);

/**
 * Whether an imported value can stand in for the default one. The file is user-supplied
 * and lands straight in the storage the whole app reads, so a value of the wrong type
 * is dropped rather than written.
 */
const matchesDefault = (key: string, value: unknown, defaultValue: unknown): boolean => {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
  }

  if (defaultValue === undefined) {
    return typeof value === OPTIONAL_CONFIG_TYPES[key];
  }

  return typeof value === typeof defaultValue;
};

/**
 * The device config reduced to the keys a backup may carry, each with a value of the
 * type the default has. Keys the running build does not know are dropped, which is
 * what lets a file written by a newer version be imported by an older one.
 *
 * `keys` narrows that to one settings group. It is what keeps the groups apart on the
 * way in as well as on the way out: a hand-edited file cannot smuggle player settings
 * in under the group the user only ticked for the interface.
 */
export const sanitizeConfig = <T extends object>(
  raw: unknown,
  defaults: T,
  keys?: readonly string[]
): Partial<T> => {
  if (!isRecord(raw)) {
    return {};
  }

  const values = (keys ?? Object.keys(defaults)).reduce((acc: Record<string, unknown>, key) => {
    if (isDeviceConfigKey(key) || !(key in raw)) {
      return acc;
    }

    if (matchesDefault(key, raw[key], (defaults as Record<string, unknown>)[key])) {
      acc[key] = raw[key];
    }

    return acc;
  }, {});

  return values as Partial<T>;
};

/**
 * The config to store after an import: the file's settings over what the device holds,
 * with every key of the imported groups first put back to its default -- one the file
 * leaves out goes back to the default rather than keeping the value it happened to
 * have. The groups that were not imported, and this device's own keys, are untouched.
 *
 * `keys` defaults to every key of the config, which is the whole of the settings.
 */
export const mergeConfig = (
  current: DeviceConfigType,
  imported: unknown,
  defaults: DeviceConfigType,
  keys?: readonly string[]
): DeviceConfigType => {
  const importedKeys = (keys ?? Object.keys(defaults)).filter((key) => !isDeviceConfigKey(key));

  const defaultValues = importedKeys.reduce((acc: Record<string, unknown>, key) => {
    acc[key] = (defaults as Record<string, unknown>)[key];

    return acc;
  }, {});

  return {
    ...current,
    ...defaultValues,
    ...sanitizeConfig(imported, defaults, importedKeys),
  } as DeviceConfigType;
};

export const sanitizeServiceConfig = (raw: unknown): Partial<ApiInterfaceConfig> => {
  if (!isRecord(raw)) {
    return {};
  }

  const values = SERVICE_CONFIG_KEYS.reduce((acc: Record<string, unknown>, key) => {
    if (typeof raw[key] === SERVICE_CONFIG_TYPES[key]) {
      acc[key] = raw[key];
    }

    return acc;
  }, {});

  return values as Partial<ApiInterfaceConfig>;
};

const isFilmCard = (value: unknown): value is FilmCardInterface => (
  isRecord(value)
  && typeof value.id === 'string'
  && typeof value.link === 'string'
  && typeof value.title === 'string'
);

const isCategory = (value: unknown): value is LocalCategoryInterface => (
  isRecord(value)
  && typeof value.id === 'string'
  && typeof value.title === 'string'
  && Array.isArray(value.filmIds)
  && value.filmIds.every((filmId) => typeof filmId === 'string')
);

/**
 * The bookmarks blob with anything malformed dropped. Categories keep only the film ids
 * they have a card for, so a half-written file cannot leave a category pointing at
 * films the library has no way to render.
 */
export const sanitizeBookmarks = (raw: unknown): LocalBookmarksBlob | null => {
  if (!isRecord(raw) || !Array.isArray(raw.categories) || !isRecord(raw.films)) {
    return null;
  }

  const films = Object.entries(raw.films).reduce((acc: Record<string, FilmCardInterface>, [id, film]) => {
    if (isFilmCard(film)) {
      acc[id] = film;
    }

    return acc;
  }, {});

  const categories = raw.categories.filter(isCategory).map((category) => ({
    ...category,
    filmIds: category.filmIds.filter((filmId) => filmId in films),
  }));

  return { categories, films };
};

const isComment = (value: unknown): value is LocalCommentInterface => (
  isRecord(value)
  && typeof value.id === 'string'
  && typeof value.filmId === 'string'
  && typeof value.link === 'string'
  && typeof value.title === 'string'
  && typeof value.text === 'string'
  && typeof value.createdAt === 'number'
);

export const sanitizeComments = (raw: unknown): LocalCommentInterface[] => (
  Array.isArray(raw) ? raw.filter(isComment) : []
);

const isNotificationItem = (value: unknown): value is NotificationItemInterface => (
  isRecord(value)
  && typeof value.name === 'string'
  && typeof value.link === 'string'
);

export const sanitizeNotifications = (raw: unknown): NotificationItemInterface[] => (
  Array.isArray(raw) ? raw.filter(isNotificationItem) : []
);

/**
 * The file's contents, or null when it is not a backup this build can read: written by
 * another app, or in a format newer than this one knows.
 */
export const parseBackupFile = (raw: string | null | undefined): BackupFileInterface | null => {
  const parsed = safeJsonParse<unknown>(raw);

  if (!isRecord(parsed) || !isRecord(parsed.data)) {
    return null;
  }

  if (parsed.app !== BACKUP_APP_ID) {
    return null;
  }

  if (typeof parsed.version !== 'number' || parsed.version > BACKUP_FORMAT_VERSION) {
    return null;
  }

  return parsed as unknown as BackupFileInterface;
};

/** The sections a file actually carries, in the order they are listed to the user. */
export const getBackupSections = (data: BackupDataInterface): BACKUP_SECTION[] => (
  BACKUP_SECTIONS.filter((section) => data[section] !== undefined && data[section] !== null)
);

export const buildBackupFileName = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-');

  return `${BACKUP_FILE_PREFIX}-${stamp}-${pad(date.getHours())}${pad(date.getMinutes())}.json`;
};
