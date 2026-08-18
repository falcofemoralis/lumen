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
  playerAutoFrameRateEnabled: boolean;
  playerAutoFrameRate: boolean;
  playerLongPressSpeed: number;
  playerVolumeGesture: boolean;
  playerBrightnessGesture: boolean;
  playerSwapGestureSides: boolean;
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
  tvSearchEnabled: boolean;
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
  // Two switches rather than one, because they answer different questions. This one is
  // whether the player offers frame rate matching at all, and it is off by default:
  // switching the refresh rate blanks the TV for a moment every time a source starts, and
  // a good few devices report no mode to switch to anyway - neither of which is worth
  // handing to everyone who never asked for it, nor worth a button they will never press.
  playerAutoFrameRateEnabled: false,
  // ...and this one is whether matching is currently on, which the player's own button
  // toggles. Kept apart so that turning the feature off in the settings does not throw
  // away the choice someone made about their films.
  playerAutoFrameRate: false,
  playerLongPressSpeed: 1.5,
  // Both off unless asked for: they claim a vertical swipe over half the player each,
  // and someone who does not know they are there only ever meets them by accident -
  // as a video that suddenly went silent, or a screen that went dark on its own.
  playerVolumeGesture: false,
  playerBrightnessGesture: false,
  // volume on the right and brightness on the left, which is where the players people
  // are coming from put them - the switch is for the hand that disagrees
  playerSwapGestureSides: false,
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
  // Both TV surfaces are on unless the user says otherwise. Note that a default
  // reaches everyone who never touched the switch, upgrades included - `setConfig`
  // only ever stores keys that were explicitly written.
  tvChannelsEnabled: true,
  tvSearchEnabled: true,
};