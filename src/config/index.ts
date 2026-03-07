import { HOME_SCREEN } from 'Navigation/navigationRoutes';

export type DeviceConfigType = {
  isConfigured: boolean;
  isTV: boolean;
  isFirestore: boolean;
  securedSettings: boolean;
  isTVGridAnimation: boolean;
  isTVAwake: boolean;
  numberOfColumnsMobile: number;
  numberOfColumnsTV: number;
  initialRoute: string;
  playerRewindSeconds: number;
  themeScheme?: string;
  downloadsPath?: string;
  downloadsSaveSubtitles: boolean;
  downloadsSavePoster: boolean;
}

export const defaultConfig: DeviceConfigType = {
  isConfigured: false,
  isTV: false,
  isFirestore: false,
  securedSettings: false,
  isTVGridAnimation: true,
  isTVAwake: false,
  numberOfColumnsMobile: 3,
  numberOfColumnsTV: 6,
  initialRoute: HOME_SCREEN,
  playerRewindSeconds: 10,
  themeScheme: undefined,
  downloadsPath: undefined,
  downloadsSaveSubtitles: true,
  downloadsSavePoster: true,
};