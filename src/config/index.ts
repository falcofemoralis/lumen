import {
  ASPECT_RATIO_OPTIONS,
  DEFAULT_SPEED,
  DEFAULT_SUBTITLES_BACKGROUND_COLOR,
  DEFAULT_SUBTITLES_BOTTOM_OFFSET,
  DEFAULT_SUBTITLES_COLOR,
  DEFAULT_SUBTITLES_EDGE_TYPE,
  DEFAULT_SUBTITLES_SIZE_SCALE,
} from 'Component/Player/Player.config';
import { HOME_SCREEN } from 'Navigation/navigationRoutes';
import { BACKUP_SECTION } from 'Type/Backup.interface';
import { BackupConfigKey, SettingsSection } from 'Util/Backup/logic';
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
  hiddenCountries: string[];
  initialRoute: string;
  homeDefaultTab: string;
  playerRewindSeconds: number;
  playerBackwardRewindSeconds: number;
  playerShowBufferTime: boolean;
  playerShowEndTime: boolean;
  playerShowEpisodeName: boolean;
  playerSubtitlesCustomStyle: boolean;
  playerSubtitlesSizeScale: number;
  playerSubtitlesColor: string;
  playerSubtitlesBackgroundColor: string;
  playerSubtitlesEdgeType: string;
  playerSubtitlesBottomOffset: number;
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
  showVotesCount: boolean;
  showRecommendations: boolean;
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
  hiddenCountries: [],
  initialRoute: HOME_SCREEN,
  homeDefaultTab: '',
  playerRewindSeconds: 10,
  playerBackwardRewindSeconds: 10,
  playerShowBufferTime: false,
  playerShowEndTime: false,
  playerShowEpisodeName: false,
  playerSubtitlesCustomStyle: false,
  playerSubtitlesSizeScale: DEFAULT_SUBTITLES_SIZE_SCALE,
  playerSubtitlesColor: DEFAULT_SUBTITLES_COLOR,
  playerSubtitlesBackgroundColor: DEFAULT_SUBTITLES_BACKGROUND_COLOR,
  playerSubtitlesEdgeType: DEFAULT_SUBTITLES_EDGE_TYPE,
  playerSubtitlesBottomOffset: DEFAULT_SUBTITLES_BOTTOM_OFFSET,
  themeScheme: undefined,
  downloadsPath: undefined,
  downloadsSaveSubtitles: true,
  downloadsSavePoster: true,
  downloadsMaxParallel: DEFAULT_MAX_PARALLEL_DOWNLOADS,
  playerSaveQuality: true,
  playerAskQuality: false,
  playerAutoNextEpisode: true,
  playerAutoFrameRateEnabled: false,
  playerAutoFrameRate: false,
  playerLongPressSpeed: 1.5,
  playerVolumeGesture: false,
  playerBrightnessGesture: false,
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
  tvChannelsEnabled: true,
  tvSearchEnabled: true,
  showVotesCount: true,
  showRecommendations: true,
};

export const CONFIG_KEY_SECTIONS = {
  themeScheme: BACKUP_SECTION.SETTINGS_APPEARANCE,
  initialRoute: BACKUP_SECTION.SETTINGS_APPEARANCE,
  homeDefaultTab: BACKUP_SECTION.SETTINGS_APPEARANCE,
  numberOfColumnsMobile: BACKUP_SECTION.SETTINGS_APPEARANCE,
  numberOfColumnsTV: BACKUP_SECTION.SETTINGS_APPEARANCE,
  recentTwoColumnsTV: BACKUP_SECTION.SETTINGS_APPEARANCE,
  hiddenCountries: BACKUP_SECTION.SETTINGS_APPEARANCE,
  isLocalLibrary: BACKUP_SECTION.SETTINGS_APPEARANCE,
  isLowMode: BACKUP_SECTION.SETTINGS_APPEARANCE,
  isTVAwake: BACKUP_SECTION.SETTINGS_APPEARANCE,
  sortVoicesByRating: BACKUP_SECTION.SETTINGS_APPEARANCE,
  isContinueBtnEnabled: BACKUP_SECTION.SETTINGS_APPEARANCE,
  commentPostingMobile: BACKUP_SECTION.SETTINGS_APPEARANCE,
  commentPostingTV: BACKUP_SECTION.SETTINGS_APPEARANCE,
  tvChannelsEnabled: BACKUP_SECTION.SETTINGS_APPEARANCE,
  tvSearchEnabled: BACKUP_SECTION.SETTINGS_APPEARANCE,
  showVotesCount: BACKUP_SECTION.SETTINGS_APPEARANCE,
  showRecommendations: BACKUP_SECTION.SETTINGS_APPEARANCE,

  strictConnectionCheck: BACKUP_SECTION.SETTINGS_NETWORK,

  downloadsSaveSubtitles: BACKUP_SECTION.SETTINGS_DOWNLOADS,
  downloadsSavePoster: BACKUP_SECTION.SETTINGS_DOWNLOADS,
  downloadsMaxParallel: BACKUP_SECTION.SETTINGS_DOWNLOADS,

  playerSaveQuality: BACKUP_SECTION.SETTINGS_PLAYER,
  playerAskQuality: BACKUP_SECTION.SETTINGS_PLAYER,
  playerRewindSeconds: BACKUP_SECTION.SETTINGS_PLAYER,
  playerBackwardRewindSeconds: BACKUP_SECTION.SETTINGS_PLAYER,
  playerDefaultAspectRatio: BACKUP_SECTION.SETTINGS_PLAYER,
  playerDefaultSpeed: BACKUP_SECTION.SETTINGS_PLAYER,
  playerAutoNextEpisode: BACKUP_SECTION.SETTINGS_PLAYER,
  playerAutoFrameRateEnabled: BACKUP_SECTION.SETTINGS_PLAYER,
  playerAutoFrameRate: BACKUP_SECTION.SETTINGS_PLAYER,
  playerLongPressSpeed: BACKUP_SECTION.SETTINGS_PLAYER,
  playerVolumeGesture: BACKUP_SECTION.SETTINGS_PLAYER,
  playerBrightnessGesture: BACKUP_SECTION.SETTINGS_PLAYER,
  playerSwapGestureSides: BACKUP_SECTION.SETTINGS_PLAYER,
  playerStopPlayOnButtonTV: BACKUP_SECTION.SETTINGS_PLAYER,
  playerStopPlayShowInterfaceTV: BACKUP_SECTION.SETTINGS_PLAYER,
  playerShowBufferTime: BACKUP_SECTION.SETTINGS_PLAYER,
  playerShowEndTime: BACKUP_SECTION.SETTINGS_PLAYER,
  playerShowEpisodeName: BACKUP_SECTION.SETTINGS_PLAYER,
  playerSubtitlesCustomStyle: BACKUP_SECTION.SETTINGS_PLAYER,
  playerSubtitlesSizeScale: BACKUP_SECTION.SETTINGS_PLAYER,
  playerSubtitlesColor: BACKUP_SECTION.SETTINGS_PLAYER,
  playerSubtitlesBackgroundColor: BACKUP_SECTION.SETTINGS_PLAYER,
  playerSubtitlesEdgeType: BACKUP_SECTION.SETTINGS_PLAYER,
  playerSubtitlesBottomOffset: BACKUP_SECTION.SETTINGS_PLAYER,
  playerBufferTimeSetting: BACKUP_SECTION.SETTINGS_PLAYER,
  playerBackBufferTimeSetting: BACKUP_SECTION.SETTINGS_PLAYER,

  checkForUpdates: BACKUP_SECTION.SETTINGS_OTHER,
  isFirestore: BACKUP_SECTION.SETTINGS_OTHER,
} as const satisfies Record<BackupConfigKey, SettingsSection>;