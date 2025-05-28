import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  tabBarContainer: {
    position: 'relative',
    alignItems: 'center',
    height: 42,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabText: {
    color: Colors.text,
    fontSize: 12,
    opacity: 0.7,
    transitionProperty: 'opacity',
    transitionDuration: '250ms',
  },
  activeTabText: {
    fontWeight: 'bold',
    opacity: 1,
  },
});
