import { Colors } from 'Style/Colors';
import { CONTENT_WRAPPER_PADDING } from 'Style/Layout';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  setting: {
  },
  settingHidden: {
    opacity: 0.5,
  },
  settingContainer: {
    justifyContent: 'flex-start',
    paddingHorizontal: CONTENT_WRAPPER_PADDING,
    paddingVertical: 12,
  },
  settingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingContent: {
    width: 'auto',
    maxWidth: '90%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  settingIcon: {
  },
  settingTitle: {
    fontSize: 14,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
});