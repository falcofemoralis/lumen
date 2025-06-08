import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
  },
  menuListWrapper: {
    height: 48,
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
});
