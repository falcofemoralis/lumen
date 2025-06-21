import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  setting: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.transparent,
    borderRadius: 16,
  },
  settingFocused: {
    backgroundColor: Colors.backgroundFocused,
  },
  settingTitle: {
  },
  settingTitleFocused: {
    color: Colors.textFocused,
  },
  settingSubtitle: {
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  settingSubtitleFocused: {
    color: Colors.textFocused,
  },
  overlay: {
    gap: 16,
    maxHeight: 288,
    width: 250,
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
