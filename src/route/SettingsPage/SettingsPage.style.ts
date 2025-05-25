import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    gap: 24,
  },
  topActionsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    margin: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  setting: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  settingContainer: {
  },
  settingTitle: {
  },
  settingSubtitle: {
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  overlay: {
    gap: 16,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  overlayInput: {

  },
  overlayButton: {

  },
});
