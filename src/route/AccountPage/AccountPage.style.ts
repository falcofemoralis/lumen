import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  topBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 24,
  },
  tobBarBtn: {
    width: 32,
    height: 32,
    backgroundColor: Colors.transparent,
  },
  tobBarBtnIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    backgroundColor: Colors.secondary,
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
