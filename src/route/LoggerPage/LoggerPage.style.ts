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
  },
  action: {
    flex: 1,
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
    width: '100%',
    padding: 8,
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
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
    paddingBlock: 8,
  },
});
