import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    height: '100%',
    width: '100%',
  },
  item: {
    paddingInline: 16,
    paddingBlock: 8,
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
  },
  itemError: {
    backgroundColor: Colors.error,
  },
  itemFocused: {
    backgroundColor: Colors.backgroundLighter,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: Colors.primary,
    color: Colors.textOnPrimary,
  },
  empty: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  device: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceTitle: {
    fontSize: 16,
  },
  deviceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
