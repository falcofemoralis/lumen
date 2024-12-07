import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const NAVIGATION_BAR_Z_INDEX = 100;
export const NAVIGATION_BAR_TV_WIDTH = 80;
export const NAVIGATION_BAR_TV_WIDTH_EXPANDED = 256;
export const NAVIGATION_BAR_TV_WIDTH_PADDING = 12;
export const NAVIGATION_BAR_TV_TAB_WIDTH =
  NAVIGATION_BAR_TV_WIDTH - NAVIGATION_BAR_TV_WIDTH_PADDING * 2;
export const NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED = NAVIGATION_BAR_TV_TAB_WIDTH + 100;

export const styles = CreateStyles({
  slot: {
    width: '100%',
    height: '100%',
    marginLeft: NAVIGATION_BAR_TV_WIDTH,
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'transparent',
    height: '100%',
    width: NAVIGATION_BAR_TV_WIDTH,
    paddingHorizontal: NAVIGATION_BAR_TV_WIDTH_PADDING,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: NAVIGATION_BAR_Z_INDEX,
  },
  barBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    width: NAVIGATION_BAR_TV_WIDTH,
    zIndex: NAVIGATION_BAR_Z_INDEX + 1,
  },
  barBackgroundOpened: {
    width: NAVIGATION_BAR_TV_WIDTH_EXPANDED + 200,
  },
  tabs: {
    width: NAVIGATION_BAR_TV_TAB_WIDTH,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    zIndex: NAVIGATION_BAR_Z_INDEX + 2,
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
    paddingHorizontal: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  tabSelected: {
    backgroundColor: Colors.secondary,
    borderRadius: 24,
  },
  tabFocused: {
    backgroundColor: Colors.white,
    borderRadius: 24,
  },
  tabIcon: {
    opacity: 1,
    marginLeft: 2,
  },
  tabText: {
    display: 'flex',
    position: 'absolute',
    left: 48,
    color: Colors.white,
    opacity: 0,
  },
  tabTextOpened: {
    opacity: 1,
  },
  tabContentFocused: {
    color: Colors.black,
  },
});
