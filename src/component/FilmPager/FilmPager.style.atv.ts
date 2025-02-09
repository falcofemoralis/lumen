import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  pagerView: {
    flex: 1,
  },
  menuListWrapper: {
    height: 40,
    zIndex: 10,
    backgroundColor: Colors.background,
  },
  menuListScroll: {},
  menuList: {
    gap: 8,
  },
  gridWrapper: {
    paddingTop: 16,
    paddingHorizontal: 8,
    zIndex: 2,
  },
});
