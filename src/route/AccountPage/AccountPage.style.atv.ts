import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  content: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    width: '100%',
  },
  profileInfo: {
    width: '50%',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  profileInfoAvatarContainer: {
    position: 'relative',
    height: 64,
    width: 64,
  },
  profileInfoPremium: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
  profileAvatar: {
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
    width: '60%',
    gap: 12,
    paddingBlock: 6,
    paddingInline: 16,
  },
  profileAction: {
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
    width: '70%',
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
