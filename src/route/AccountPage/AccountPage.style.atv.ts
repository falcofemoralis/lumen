import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  profile: {
    width: '100%',
  },
  profileInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    backgroundColor: Colors.gray,
    borderRadius: 99,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileActionsWrapper: {
    marginTop: 16,
    height: 48,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  profileActions: {
    gap: 8,
  },
  profileAction: {
    padding: 6,
    paddingInline: 8,
    borderRadius: 24,
  },
});
