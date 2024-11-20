import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const NAVIGATION_BAR_TV_WIDTH = 80;
export const NAVIGATION_BAR_TV_WIDTH_EXPANDED = 256;

export const styles = CreateStyles({
  layout: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  container: {
    backgroundColor: 'transparent',
    height: '100%',
    width: NAVIGATION_BAR_TV_WIDTH,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  focusedContainer: {
    width: NAVIGATION_BAR_TV_WIDTH_EXPANDED,
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
  activeTab: {
    backgroundColor: 'rgba(0, 74, 119, 0.4)',
  },
  focusedTab: {
    backgroundColor: Colors.white,
  },
  tabIcon: {
    opacity: 1,
  },
  tabText: {
    display: 'flex',
    position: 'absolute',
    left: 48,
    color: Colors.white,
  },
});
