import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
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
    gap: scale(16),
    alignItems: 'center',
  },
  profileInfoAvatarContainer: {
    position: 'relative',
    height: scale(64),
    width: scale(64),
  },
  profileInfoPremium: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
  profileAvatar: {
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(99),
  },
  profileName: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  profileSubname: {
    fontSize: scale(text.xs.fontSize),
    textAlign: 'center',
  },
  profileActions: {
    width: '60%',
    gap: scale(12),
    paddingBlock: scale(6),
    paddingInline: scale(16),
  },
  profileAction: {
  },
  profileActionContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
  },
  profileActionText: {
    fontSize: scale(text.xs.fontSize),
    fontWeight: '500',
  },
  premiumBadgeContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    width: '70%',
  },
  premiumBadge: {
    backgroundColor: colors.transparent,
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: scale(8),
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
    right: scale(16),
    top: scale(16),
    width: scale(80),
    height: scale(20),
  },
  premiumBadgeHeading: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
    zIndex: 10,
  },
  premiumBadgeText: {
    fontSize: scale(text.xs.fontSize),
    fontWeight: '500',
    zIndex: 10,
  },
  premiumButton: {
    backgroundColor: '#5B359A',
  },
  premiumButtonText: {
    color: colors.textOnContrast,
  },
  premiumButtonIcon: {
    color: colors.iconOnContrast,
  },
} satisfies ThemedStyles);
