import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const TAB_ADDITIONAL_SIZE = 20;

export const styles = CreateStyles({
  tabBar: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  tabs: {
    width: '100%',
    flexDirection: 'row',
    height: 50,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'column',
    height: 50 + TAB_ADDITIONAL_SIZE,
    top: -TAB_ADDITIONAL_SIZE / 2,
    borderRadius: 99,
    position: 'absolute',
  },
  tab: {
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 99,
    opacity: 0.7,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  tabFocused: {
    opacity: 1,
  },
  tabIcon: {
  },
  tabText: {
    fontSize: 12,
  },
  tabTextFocused: {
    fontWeight: 700,
  },
  tabAccount: {
    opacity: 1,
  },
  profileAvatar: {
    width: 22,
    height: 22,
    backgroundColor: Colors.background,
    borderRadius: 99,
  },
  profileAvatarContainer: {
    borderRadius: 99,
    borderWidth: 2,
    borderColor: Colors.transparent,
    transitionProperty: 'borderColor',
    transitionDuration: '150ms',
  },
  profileAvatarFocused: {
    borderColor: Colors.white,
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
