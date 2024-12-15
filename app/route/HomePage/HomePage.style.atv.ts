import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  pagerView: {
    flex: 1,
  },
  menuListWrapper: {
    height: 50,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  menuListScroll: {},
  menuList: {
    gap: 8,
  },
  gridWrapper: {
    zIndex: 2,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
