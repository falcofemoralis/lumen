import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const NAVIGATION_BAR_Z_INDEX = 100;
export const NAVIGATION_BAR_TV_WIDTH = 80;
export const NAVIGATION_BAR_TV_WIDTH_EXPANDED = 256;
export const NAVIGATION_BAR_TV_WIDTH_PADDING = 12;

export const NAVIGATION_BAR_TV_TAB_WIDTH = NAVIGATION_BAR_TV_WIDTH - NAVIGATION_BAR_TV_WIDTH_PADDING * 2;
export const NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED = NAVIGATION_BAR_TV_TAB_WIDTH + 100;

export const styles = CreateStyles({
  layout: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  slot: {
    width: '100%',
    height: '100%',
  },
  bar: {
    left: 0,
    top: 0,
    height: '100%',
    width: NAVIGATION_BAR_TV_WIDTH,
    paddingHorizontal: NAVIGATION_BAR_TV_WIDTH_PADDING,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: NAVIGATION_BAR_Z_INDEX,
  },
  barBackgroundOpened: {
    width: NAVIGATION_BAR_TV_WIDTH_EXPANDED + 200,
  },
  tabs: {
    width: NAVIGATION_BAR_TV_TAB_WIDTH,
    height: '100%',
    justifyContent: 'space-between',
    overflow: 'hidden',
    zIndex: NAVIGATION_BAR_Z_INDEX + 2,
    transitionProperty: 'width',
    transitionDuration: '250ms',
  },
  tabsOpened: {
    width: NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED,
  },
  tab: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginBottom: 12,
  },
  tabSelected: {
    backgroundColor: Colors.tertiary,
    borderRadius: 24,
  },
  tabFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 24,
  },
  tabIcon: {
    opacity: 1,
    marginLeft: 3,
  },
  tabText: {
    display: 'flex',
    position: 'absolute',
    left: 48,
    color: Colors.text,
    opacity: 0,
  },
  tabTextOpened: {
    opacity: 1,
  },
  tabContentFocused: {
    color: Colors.textFocused,
  },
  profile: {
    height: 32,
  },
  profileNameText: {
    left: 8,
    top: 0,
    fontWeight: '700',
  },
  profileSwitchText: {
    left: 8,
    bottom: 0,
    color: Colors.textSecondary,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 99,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  profileAvatarContainer: {
  },
  badge: {
    backgroundColor: Colors.secondary,
    width: 16,
    height: 16,
    borderRadius: 50,
    fontSize: 12,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'absolute',
    right: -8,
    top: -8,
  },
});
