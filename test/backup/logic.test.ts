import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BACKUP_SECTION } from 'Type/Backup.interface';
import {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  BACKUP_SECTIONS,
  buildBackupFileName,
  CONFIG_KEY_SECTIONS,
  getBackupSections,
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
  SETTINGS_SECTIONS,
} from 'Util/Backup/logic';

// a stand-in for the device config: the real one drags the whole app in, and the
// functions under test take the defaults they validate against as an argument
const defaults = {
  isTV: false,
  isConfigured: false,
  securedSettings: false,
  downloadsPath: undefined,
  numberOfColumnsMobile: 3,
  hiddenCountries: [] as string[],
  playerAutoNextEpisode: true,
  themeScheme: undefined,
  playerBufferTimeSetting: undefined,
};

type Defaults = typeof defaults;

const backupFile = (data: Record<string, unknown>) => JSON.stringify({
  app: BACKUP_APP_ID,
  version: BACKUP_FORMAT_VERSION,
  createdAt: 0,
  data,
});

test('sanitizeConfig keeps known keys with a value of the default type', () => {
  assert.deepEqual(
    sanitizeConfig({ numberOfColumnsMobile: 5, playerAutoNextEpisode: false }, defaults),
    { numberOfColumnsMobile: 5, playerAutoNextEpisode: false }
  );
});

test('sanitizeConfig drops the keys that belong to the device', () => {
  const config = sanitizeConfig({
    isTV: true,
    isConfigured: true,
    securedSettings: true,
    downloadsPath: '/storage/emulated/0/Download',
    numberOfColumnsMobile: 4,
  }, defaults);

  assert.deepEqual(config, { numberOfColumnsMobile: 4 });
});

test('sanitizeConfig drops unknown keys and values of the wrong type', () => {
  const config = sanitizeConfig({
    numberOfColumnsMobile: 'four',
    playerAutoNextEpisode: 1,
    hiddenCountries: ['USA'],
    somethingElse: true,
  }, defaults);

  assert.deepEqual(config, { hiddenCountries: ['USA'] });
});

test('sanitizeConfig checks the members of an array setting', () => {
  assert.deepEqual(sanitizeConfig({ hiddenCountries: ['USA', 7] }, defaults), {});
});

test('sanitizeConfig types the keys that have no default value', () => {
  assert.deepEqual(sanitizeConfig({ themeScheme: 'dark' }, defaults), { themeScheme: 'dark' });
  assert.deepEqual(sanitizeConfig({ themeScheme: 3 }, defaults), {});
  assert.deepEqual(sanitizeConfig({ playerBufferTimeSetting: 50 }, defaults), { playerBufferTimeSetting: 50 });
});

test('sanitizeConfig ignores anything that is not an object', () => {
  assert.deepEqual(sanitizeConfig(null, defaults), {});
  assert.deepEqual(sanitizeConfig([1, 2], defaults), {});
});

test('sanitizeConfig keeps to the keys of the group it was given', () => {
  const config = sanitizeConfig(
    { numberOfColumnsMobile: 5, playerAutoNextEpisode: false },
    defaults,
    ['numberOfColumnsMobile']
  );

  assert.deepEqual(config, { numberOfColumnsMobile: 5 });
});

test('mergeConfig puts the imported settings over the defaults', () => {
  const current = { ...defaults, numberOfColumnsMobile: 6, playerAutoNextEpisode: false } as Defaults;

  const merged = mergeConfig(
    current as never,
    { numberOfColumnsMobile: 2 },
    defaults as never
  ) as unknown as Defaults;

  assert.equal(merged.numberOfColumnsMobile, 2);
  // left out of the file, so it goes back to the default rather than keeping the current value
  assert.equal(merged.playerAutoNextEpisode, true);
});

test('mergeConfig leaves the settings of the groups that were not imported alone', () => {
  const current = { ...defaults, numberOfColumnsMobile: 6, playerAutoNextEpisode: false } as Defaults;

  const merged = mergeConfig(
    current as never,
    { numberOfColumnsMobile: 2, playerAutoNextEpisode: true },
    defaults as never,
    ['numberOfColumnsMobile']
  ) as unknown as Defaults;

  assert.equal(merged.numberOfColumnsMobile, 2);
  // outside the imported group: neither the file's value nor the default takes hold
  assert.equal(merged.playerAutoNextEpisode, false);
});

test('mergeConfig defaults a key of an imported group the file leaves out', () => {
  const current = { ...defaults, numberOfColumnsMobile: 6, hiddenCountries: ['USA'] } as Defaults;

  const merged = mergeConfig(
    current as never,
    {},
    defaults as never,
    ['numberOfColumnsMobile']
  ) as unknown as Defaults;

  assert.equal(merged.numberOfColumnsMobile, 3);
  assert.deepEqual(merged.hiddenCountries, ['USA']);
});

test('mergeConfig keeps the device keys of the device it imports on', () => {
  const current = {
    ...defaults,
    isTV: true,
    isConfigured: true,
    downloadsPath: '/storage/emulated/0/Download',
  } as Defaults;

  const merged = mergeConfig(
    current as never,
    { isTV: false, isConfigured: false, downloadsPath: '/sdcard/other' },
    defaults as never
  ) as unknown as Defaults;

  assert.equal(merged.isTV, true);
  assert.equal(merged.isConfigured, true);
  assert.equal(merged.downloadsPath, '/storage/emulated/0/Download');
});

test('sanitizeServiceConfig keeps only the known keys with the right types', () => {
  assert.deepEqual(
    sanitizeServiceConfig({
      provider: 'https://example.com',
      autoCdn: 'yes',
      cdn: 42,
      officialMode: '1',
      whatever: 'x',
    }),
    { provider: 'https://example.com', officialMode: '1' }
  );
});

test('sanitizeBookmarks drops malformed films and categories', () => {
  const blob = sanitizeBookmarks({
    categories: [
      { id: 'c1', title: 'Favorites', filmIds: ['f1', 'f2'], createdAt: 1 },
      { id: 'c2', filmIds: [] },
    ],
    films: {
      f1: { id: 'f1', link: '/films/f1', title: 'Film 1' },
      f2: { id: 'f2', title: 'no link' },
    },
  });

  assert.deepEqual(blob, {
    categories: [{ id: 'c1', title: 'Favorites', filmIds: ['f1'], createdAt: 1 }],
    films: { f1: { id: 'f1', link: '/films/f1', title: 'Film 1' } },
  });
});

test('sanitizeBookmarks refuses a blob that is not one', () => {
  assert.equal(sanitizeBookmarks({ categories: [] }), null);
  assert.equal(sanitizeBookmarks(null), null);
});

test('sanitizeComments keeps only complete comments', () => {
  const comment = {
    id: '1-a',
    filmId: 'f1',
    link: '/films/f1',
    poster: 'poster.jpg',
    title: 'Film 1',
    text: 'nice',
    createdAt: 10,
  };

  assert.deepEqual(sanitizeComments([comment, { id: '2-b' }, 'nope']), [comment]);
  assert.deepEqual(sanitizeComments({ }), []);
});

test('sanitizeNotifications keeps only complete items', () => {
  const item = { name: 'Series', link: '/series/1' };

  assert.deepEqual(sanitizeNotifications([item, { name: 'no link' }]), [item]);
});

test('parseBackupFile reads a file this build wrote', () => {
  const backup = parseBackupFile(backupFile({ [BACKUP_SECTION.COMMENTS]: [] }));

  assert.equal(backup?.app, BACKUP_APP_ID);
  assert.deepEqual(backup?.data[BACKUP_SECTION.COMMENTS], []);
});

test('parseBackupFile refuses a file that is not a backup of this app', () => {
  assert.equal(parseBackupFile('not json at all'), null);
  assert.equal(parseBackupFile('{}'), null);
  assert.equal(parseBackupFile(JSON.stringify({ app: 'other', version: 1, data: {} })), null);
  assert.equal(parseBackupFile(JSON.stringify({ app: BACKUP_APP_ID, version: 1 })), null);
});

test('parseBackupFile refuses a format newer than it knows', () => {
  assert.equal(
    parseBackupFile(JSON.stringify({
      app: BACKUP_APP_ID,
      version: BACKUP_FORMAT_VERSION + 1,
      data: {},
    })),
    null
  );
});

test('getBackupSections lists the sections a file carries, in order', () => {
  assert.deepEqual(
    getBackupSections({
      [BACKUP_SECTION.COMMENTS]: [],
      [BACKUP_SECTION.SETTINGS_PLAYER]: { config: {} },
      [BACKUP_SECTION.SETTINGS_APPEARANCE]: { config: {} },
    }),
    [
      BACKUP_SECTION.SETTINGS_APPEARANCE,
      BACKUP_SECTION.SETTINGS_PLAYER,
      BACKUP_SECTION.COMMENTS,
    ]
  );
  assert.deepEqual(getBackupSections({}), []);
});

test('every settings group is offered on its own and knows its own keys', () => {
  SETTINGS_SECTIONS.forEach((section) => {
    assert.ok(BACKUP_SECTIONS.includes(section));
    assert.ok(isSettingsSection(section));
    assert.ok(getSectionConfigKeys(section).length > 0);
  });

  assert.equal(isSettingsSection(BACKUP_SECTION.BOOKMARKS), false);
});

test('the groups split the config between them, with nothing shared or left over', () => {
  const grouped = SETTINGS_SECTIONS.flatMap(getSectionConfigKeys);

  assert.equal(grouped.length, new Set(grouped).size);
  assert.deepEqual(grouped.sort(), Object.keys(CONFIG_KEY_SECTIONS).sort());
});

test('getSectionsConfigKeys collects the keys of several groups at once', () => {
  assert.deepEqual(
    getSectionsConfigKeys([
      BACKUP_SECTION.SETTINGS_DOWNLOADS,
      BACKUP_SECTION.SETTINGS_OTHER,
    ]).sort(),
    [
      ...getSectionConfigKeys(BACKUP_SECTION.SETTINGS_DOWNLOADS),
      ...getSectionConfigKeys(BACKUP_SECTION.SETTINGS_OTHER),
    ].sort()
  );
  assert.deepEqual(getSectionsConfigKeys([]), []);
});

test('buildBackupFileName stamps the file with the date and time', () => {
  assert.equal(
    buildBackupFileName(new Date(2026, 7, 20, 9, 5)),
    'lumen-backup-2026-08-20-0905.json'
  );
});
