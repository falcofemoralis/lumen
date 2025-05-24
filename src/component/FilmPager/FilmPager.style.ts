import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
  },
  lazyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: Colors.background,
  },
  tabBarIndicator: {
    backgroundColor: Colors.white,
  },
  tabStyle: {
    padding: 8,
    width: 'auto',
  },
});
