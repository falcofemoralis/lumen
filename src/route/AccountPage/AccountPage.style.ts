import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

import { GRADIENT_SIZE_MOBILE } from './AccountPageGradients';

const AVATAR_SIZE = 64;

export const styles = CreateStyles({
  wrapper: {
    flex: 1,
  },
  scrollView: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 16,
    zIndex: 10,
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
  badgeContainer: {
    position: 'relative',
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
    left: 8,
    top: 8,
    zIndex: 10,
  },
  profile: {
    width: '100%',
  },
  profileInfo: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
  },
  profileInfoAvatarContainer: {
    position: 'relative',
  },
  profileInfoPremium: {
    position: 'absolute',
    left: ((GRADIENT_SIZE_MOBILE / 2) - AVATAR_SIZE / 2) * -1,
    top: ((GRADIENT_SIZE_MOBILE / 2) - AVATAR_SIZE / 2) * -1,
  },
  profileAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 99,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileSubname: {
    fontSize: 14,
    textAlign: 'center',
  },
  profileActions: {
    marginTop: 16,
    flexDirection: 'column',
    gap: 8,
  },
  profileActionsGroup: {
    width: '100%',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  profileAction: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
  },
  profileActionContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  profileActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  premiumBadgeContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
  },
  premiumBadge: {
    backgroundColor: Colors.transparent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
  },
  premiumBadgeGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: '100%',
    width: '100%',
  },
  premiumBadgeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 80,
    height: 20,
  },
  premiumBadgeHeading: {
    fontSize: 16,
    fontWeight: '700',
    zIndex: 10,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    zIndex: 10,
  },
  premiumButton: {
    backgroundColor: '#5B359A',
  },
});
