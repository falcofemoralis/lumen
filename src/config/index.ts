import { ASPECT_RATIO_OPTIONS, DEFAULT_SPEED } from 'Component/Player/Player.config';
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
  playerShowBufferTime: boolean;
  playerShowEndTime: boolean;
  themeScheme?: string;
  downloadsPath?: string;
  downloadsSaveSubtitles: boolean;
  downloadsSavePoster: boolean;
  playerAutoNextEpisode: boolean;
  playerLongPressSpeed: number;
  sortVoicesByRating: boolean;
  playerStopPlayOnButtonTV: boolean;
  playerStopPlayShowInterfaceTV: boolean;
  playerBufferTimeSetting?: number;
  checkForUpdates: boolean;
  playerSaveQuality: boolean;
  playerAskQuality: boolean;
  strictConnectionCheck: boolean;
  playerDefaultAspectRatio: string;
  playerDefaultSpeed: number;
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
  playerShowBufferTime: false,
  playerShowEndTime: false,
  themeScheme: undefined,
  downloadsPath: undefined,
  downloadsSaveSubtitles: true,
  downloadsSavePoster: true,
  playerSaveQuality: true,
  playerAskQuality: false,
  playerAutoNextEpisode: true,
  playerLongPressSpeed: 1.5,
  playerStopPlayOnButtonTV: false,
  playerStopPlayShowInterfaceTV: true,
  playerBufferTimeSetting: undefined,
  sortVoicesByRating: false,
  checkForUpdates: true,
  strictConnectionCheck: true,
  playerDefaultAspectRatio: ASPECT_RATIO_OPTIONS[0],
  playerDefaultSpeed: DEFAULT_SPEED,
};