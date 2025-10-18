import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  setting: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.transparent,
    minHeight: 64,
    justifyContent: 'center',
    borderRadius: 16,
  },
  settingFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 16,
  },
  settingHidden: {
    opacity: 0.5,
  },
  settingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingContent: {
    width: 'auto',
    maxWidth: '90%',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  settingTitleFocused: {
    color: Colors.textFocused,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  settingSubtitleFocused: {
    color: Colors.textFocused,
  },
  settingIcon: {
  },
});