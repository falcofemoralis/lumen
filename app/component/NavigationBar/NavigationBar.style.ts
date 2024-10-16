import { withTiming } from 'react-native-reanimated';
import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    backgroundColor: 'transparent',
    height: '100%',
    width: 80,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  focusedContainer: {
    width: 256,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 74, 119, 0.4)',
  },
  focusedTab: {
    backgroundColor: Colors.white,
  },
  tabIcon: {
    opacity: 1,
  },
  tabText: {
    display: 'flex',
    position: 'absolute',
    left: 24,
    color: Colors.white,
  },
});
