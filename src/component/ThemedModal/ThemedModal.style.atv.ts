import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: NAVIGATION_BAR_TV_WIDTH,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: Colors.modal,
    zIndex: 1000,
  },
  container: {
    minHeight: 100,
    minWidth: 100,
    width: 'auto',
    backgroundColor: '#1E1F20',
    padding: 16,
    borderRadius: 16,
    alignSelf: 'center',
  },
});
