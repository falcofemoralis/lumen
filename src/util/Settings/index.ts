import t from 'i18n/t';
import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';
import ConfigStore from 'Store/Config.store';
import { convertBooleanToString, convertStringToBoolean, convertStringToNumber } from 'Util/Type';

export const yesNoOptions = [
  {
    value: convertBooleanToString(true),
    label: t('Yes'),
  },
  {
    value: convertBooleanToString(false),
    label: t('No'),
  },
];

export const onSettingPress = (value: string | null, key: any) => {
  ConfigStore.updateConfig(key, convertStringToBoolean(convertStringToNumber(value)));
};

const checkEnabled = (setting: SettingItem, allSettings: SettingItem[]) => {
  const { dependsOn } = setting;

  if (!dependsOn) {
    return setting.isEnabled !== undefined ? setting.isEnabled : true;
  }

  const { field, value } = dependsOn;

  const dependedSetting = allSettings.find((s) => s.id === field);

  return dependedSetting?.value === value;
};

export const updateSettings = (settings: SettingItem[], value?: string, id?: string) => {
  return settings.map((st) => ({
    ...st,
    value: st.id === id ? value : st.value,
    isEnabled: checkEnabled(st, settings),
    settings: st.settings?.map((s) => ({
      ...s,
      value: s.id === id ? value : s.value,
      isEnabled: checkEnabled(s, st.settings ?? []),
    })),
  }));
};