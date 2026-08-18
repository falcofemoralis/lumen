import { SETTING_GROUP } from './SettingsScreen.type';

/**
 * Carries the open settings group across a language change.
 *
 * Picking a language remounts the whole screen tree (see `useLanguageReload`), which throws
 * away the settings screen's own state - so the user, who was inside a group when they made
 * the choice, would land back on the bare group list. The screen hands the group over here
 * just before asking for the change and picks it up again on the mount that follows.
 *
 * Only a language change ever writes to it and reading clears it, so a settings screen
 * opened any other way still starts where it always did.
 */
let handedOverGroup: SETTING_GROUP | null = null;

export const handOverGroup = (group: SETTING_GROUP | null) => {
  handedOverGroup = group;
};

export const takeHandedOverGroup = () => {
  const group = handedOverGroup;

  handedOverGroup = null;

  return group;
};
