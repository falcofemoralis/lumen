import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  menuListWrapper: {
    height: 48,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  menuListScroll: {},
  menuList: {
    gap: 8,
  },
  grid: {
    zIndex: 2,
    paddingTop: 8,
    height: '80%',
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
});
