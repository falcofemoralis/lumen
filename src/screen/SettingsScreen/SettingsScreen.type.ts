import { SettingItemOption } from 'Component/SettingSelect/SettingSelect.type';
import { Language } from 'i18n/index';
import { DeviceConfigType } from 'src/config';
import { ThemeContextType } from 'Theme/context';

type ConfigProps = Omit<DeviceConfigType, 'isTV'> & Pick<ThemeContextType, 'theme' | 'themeScheme'>

export type SettingsScreenComponentProps = {
  appLanguage: Language
  playerQuality: string
  officialMode: boolean
  provider: string
  officialShareLink: string
  automaticCDN: boolean
  cdn: string
  userAgent: string
  providerOptions: string[]
  cdnOptions: string[]
  homeMenuOptions: SettingItemOption[]
  downloadsPathOptions: SettingItemOption[]
  downloadsMaxParallelOptions: SettingItemOption[]
  appVersion: string
  isTvChannelsSupported: boolean
  isTvSearchSupported: boolean
  isAutoFrameRateSupported: boolean
  onConfigUpdate: (key: keyof DeviceConfigType, value: unknown) => void
  onTvChannelsAddToHome: () => Promise<void>
  onLanguageChange: (value: string) => Promise<void>
  onThemeSchemeChange: (value: string) => void
  onLocalLibraryChange: (value: boolean) => void
  onOfficialModeChange: (value: boolean) => Promise<boolean>
  onProviderChange: (value: string) => Promise<boolean>
  onOfficialShareLinkChange: (value: string) => void
  onAutomaticCDNChange: (value: boolean) => void
  onCDNChange: (value: string) => Promise<boolean>
  onUserAgentChange: (value: string) => void
  onPlayerQualityChange: (value: string) => void
} & ConfigProps;

export enum SETTING_GROUP {
  APPEARANCE = 'APPEARANCE',
  NETWORK = 'NETWORK',
  DOWNLOADS = 'DOWNLOADS',
  PLAYER = 'PLAYER',
  ABOUT = 'ABOUT',
}
