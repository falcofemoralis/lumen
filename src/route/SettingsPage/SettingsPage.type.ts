export interface SettingsPageComponentProps {
  settings: SettingItem[];
  onSettingUpdate: (id: string, value: string) => Promise<boolean>;
}

export enum SETTING_TYPE {
  INPUT = 'INPUT',
  SELECT = 'SELECT',
  TEXT = 'TEXT',
  LINK = 'LINK',
}

export type SettingType = keyof typeof SETTING_TYPE;

export type SettingItemOption = {
  label: string;
  value: string;
}

export type SettingItem = {
  id: string;
  type: SettingType;
  title: string;
  subtitle: string;
  value?: string | null;
  options?: SettingItemOption[];
}
