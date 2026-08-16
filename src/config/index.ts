import { ASPECT_RATIO_OPTIONS, DEFAULT_SPEED } from 'Component/Player/Player.config';
import { HOME_SCREEN } from 'Navigation/navigationRoutes';
import { DEFAULT_MAX_PARALLEL_DOWNLOADS } from 'Util/Download';

export type DeviceConfigType = {
  isConfigured: boolean;
  isTV: boolean;
  isFirestore: boolean;
  securedSettings: boolean;
  isLowMode: boolean;
  isTVAwake: boolean;
  numberOfColumnsMobile: number;
  numberOfColumnsTV: number;
  recentTwoColumnsTV: boolean;
  initialRoute: string;
  homeDefaultTab: string;
  playerRewindSeconds: number;
  playerShowBufferTime: boolean;
  playerShowEndTime: boolean;
  themeScheme?: string;
  downloadsPath?: string;
  downloadsSaveSubtitles: boolean;
  downloadsSavePoster: boolean;
  downloadsMaxParallel: number;
  playerAutoNextEpisode: boolean;
  playerLongPressSpeed: number;
  sortVoicesByRating: boolean;
  playerStopPlayOnButtonTV: boolean;
  playerStopPlayShowInterfaceTV: boolean;
  playerBufferTimeSetting?: number;
  playerBackBufferTimeSetting: number;
  checkForUpdates: boolean;
  playerSaveQuality: boolean;
  playerAskQuality: boolean;
  strictConnectionCheck: boolean;
  playerDefaultAspectRatio: string;
  playerDefaultSpeed: number;
  isContinueBtnEnabled: boolean;
  isLocalLibrary: boolean;
  commentPostingMobile: boolean;
  commentPostingTV: boolean;
  tvChannelsEnabled: boolean;
}

export const defaultConfig: DeviceConfigType = {
  isConfigured: false,
  isTV: false,
  isFirestore: false,
  securedSettings: false,
  isLowMode: false,
  isTVAwake: false,
  numberOfColumnsMobile: 3,
  numberOfColumnsTV: 6,
  recentTwoColumnsTV: false,
  initialRoute: HOME_SCREEN,
  homeDefaultTab: '',
  playerRewindSeconds: 10,
  playerShowBufferTime: false,
  playerShowEndTime: false,
  themeScheme: undefined,
  downloadsPath: undefined,
  downloadsSaveSubtitles: true,
  downloadsSavePoster: true,
  downloadsMaxParallel: DEFAULT_MAX_PARALLEL_DOWNLOADS,
  playerSaveQuality: true,
  playerAskQuality: false,
  playerAutoNextEpisode: true,
  playerLongPressSpeed: 1.5,
  playerStopPlayOnButtonTV: false,
  playerStopPlayShowInterfaceTV: true,
  playerBufferTimeSetting: undefined,
  playerBackBufferTimeSetting: 30,
  sortVoicesByRating: false,
  checkForUpdates: true,
  strictConnectionCheck: true,
  playerDefaultAspectRatio: ASPECT_RATIO_OPTIONS[0],
  playerDefaultSpeed: DEFAULT_SPEED,
  isContinueBtnEnabled: false,
  isLocalLibrary: false,
  commentPostingMobile: true,
  commentPostingTV: false,
  tvChannelsEnabled: false,
};