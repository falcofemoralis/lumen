export interface SettingsPageComponentProps {
  settings: SettingItem[];
  onSettingUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
}

export enum SETTING_TYPE {
  INPUT = 'INPUT',
  SELECT = 'SELECT',
  TEXT = 'TEXT',
  LINK = 'LINK',
  GROUP = 'GROUP',
}

export type SettingType = keyof typeof SETTING_TYPE;

export type SettingItemOption = {
  label: string;
  value: string;
}

export type SettingItemDependsOn = {
  field: string;
  value: string | null;
}

export type SettingItem = {
  id: string;
  type: SettingType;
  title: string;
  subtitle?: string;
  value?: string | null;
  options?: SettingItemOption[];
  dependsOn?: SettingItemDependsOn;
  isEnabled?: boolean;
  isHidden?: boolean;
  disableUpdate?: boolean;
  onSettingPress?: (
    value: string | null,
    key: any,
    setSettings: React.Dispatch<React.SetStateAction<SettingItem[]>>
  ) => void;
  settings?: SettingItem[];
  IconComponent?: React.ComponentType<any>;
}
