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
  profileAvatar: {
    width: 22,
    height: 22,
    backgroundColor: Colors.black,
    borderRadius: 99,
  },
  profileAvatarContainer: {
  },
  profileAvatarUnfocused: {
    padding: 2,
  },
  profileAvatarFocused: {
    borderRadius: 99,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badge: {
    backgroundColor: Colors.secondary,
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    right: -4,
    top: -4,
  },
});
