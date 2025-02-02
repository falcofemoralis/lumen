import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  tabBar: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGravel,
  },
  tabs: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'column',
    borderRadius: 99,
    overflow: 'hidden',
  },
  tab: {
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 99,
  },
  tabIcon: {
  },
  tabIconFocused: {
    color: Colors.primary,
  },
  tabText: {
    fontSize: 12,
  },
  tabTextFocused: {
    fontWeight: 700,
  },
});
