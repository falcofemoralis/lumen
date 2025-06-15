import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  wrapper: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 16,
  },
  tobBarBtn: {
    backgroundColor: Colors.transparent,
    width: 42,
    height: 42,
    borderRadius: 50,
  },
  tobBarBtnIcon: {
    width: 20,
    height: 20,
  },
  badge: {
    backgroundColor: Colors.secondary,
    width: 16,
    height: 16,
    borderRadius: 50,
    fontSize: 12,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
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
    backgroundColor: Colors.backgroundLight,
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
    flex: 1,
    borderRadius: 24,
  },
});
