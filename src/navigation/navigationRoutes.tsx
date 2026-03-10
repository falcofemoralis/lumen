/* eslint-disable max-len */
export const ACCOUNT_SCREEN = 'Account';
export const ACTOR_SCREEN = 'Actor';
export const BOOKMARKS_SCREEN = 'Bookmarks';
export const CATEGORY_SCREEN = 'Category';
export const ERROR_SCREEN = 'Error';
export const FILM_SCREEN = 'Film';
export const HOME_SCREEN = 'Home';
export const LOADER_SCREEN = 'Loader';
export const NOTIFICATIONS_SCREEN = 'Notifications';
export const PLAYER_SCREEN = 'Player';
export const RECENT_SCREEN = 'Recent';
export const SEARCH_SCREEN = 'Search';
export const SETTINGS_SCREEN = 'Settings';
export const WELCOME_SCREEN = 'Welcome';
export const DOWNLOADS_SCREEN = 'Downloads';
export const COLLECTION_SCREEN = 'Collection';

export const COMMENTS_MODAL_SCREEN = 'CommentsModal';
export const LOGIN_MODAL_SCREEN = 'LoginModal';
export const SCHEDULE_MODAL_SCREEN = 'ScheduleModal';
export const SETTINGS_MODAL_SCREEN = 'SettingsModal';

export const ACCOUNT_TAB = `${ACCOUNT_SCREEN}-tab`;
export const HOME_TAB = `${HOME_SCREEN}-tab`;
export const SEARCH_TAB = `${SEARCH_SCREEN}-tab`;
export const BOOKMARKS_TAB = `${BOOKMARKS_SCREEN}-tab`;
export const RECENT_TAB = `${RECENT_SCREEN}-tab`;
export const NOTIFICATIONS_TAB = `${NOTIFICATIONS_SCREEN}-tab`;

/**
* This is a list of all the screen names that will exit the app if the back button
* is pressed while in that screen. Only affects Android.
*/
export const exitRoutes = [HOME_SCREEN, SEARCH_SCREEN, BOOKMARKS_SCREEN, RECENT_SCREEN, ACCOUNT_SCREEN];
export const exitRoutesTV = [ACCOUNT_SCREEN, NOTIFICATIONS_SCREEN, HOME_SCREEN, RECENT_SCREEN, BOOKMARKS_SCREEN, SEARCH_SCREEN, SETTINGS_SCREEN];
