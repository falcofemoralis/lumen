import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  topBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 24,
  },
  tobBarBtn: {
    width: 32,
    height: 32,
    backgroundColor: Colors.transparent,
  },
  tobBarBtnIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    backgroundColor: Colors.secondary,
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    right: 0,
    top: 0,
  },
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
  profileActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  profileAction: {
    height: 32,
    padding: 6,
    paddingInline: 8,
    borderRadius: 24,
  },
});
