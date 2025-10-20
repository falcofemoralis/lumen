import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
  },
  menuListWrapper: {
    height: 40,
    zIndex: 10,
    transitionProperty: 'all',
    transitionDuration: '250ms',
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
  },
  tabButton: {
    height: '100%',
  },
  activeElement: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 99,
    transitionProperty: ['width', 'transform'],
    transitionDuration: '250ms',
    transitionTimingFunction: 'ease-in-out',
  },
  activeElementUnfocused: {
    backgroundColor: Colors.tertiary,
  },
});
