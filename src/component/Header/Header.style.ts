import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    width: '100%',
    marginVertical: 16,
    zIndex: 10,
  },
  topActionsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: Colors.whiteTransparent,
  },
  topActionsButtonContent: {
    padding: 12,
  },
});