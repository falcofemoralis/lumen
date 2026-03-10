import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  wrapper: {
    flex: 1,
  },
  scrollView: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: scale(8),
  },
  topBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: scale(16),
    zIndex: 10,
  },
  tobBarBtn: {
    backgroundColor: colors.transparent,
    width: scale(42),
    height: scale(42),
    borderRadius: scale(50),
  },
  tobBarBtnIcon: {
    width: scale(20),
    height: scale(20),
  },
  badgeContainer: {
    position: 'relative',
  },
  badge: {
    backgroundColor: colors.secondary,
    width: scale(16),
    height: scale(16),
    borderRadius: scale(50),
    fontSize: scale(text.xxs.fontSize),
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'absolute',
    left: scale(22),
    top: scale(8),
    zIndex: 10,
  },
  profile: {
    width: '100%',
  },
  profileInfo: {
    flexDirection: 'column',
    gap: scale(8),
    alignItems: 'center',
  },
  profileInfoAvatarContainer: {
    position: 'relative',
    height: scale(64),
    width: scale(64),
    borderColor: colors.icon,
    borderWidth: scale(3),
    borderRadius: scale(99),
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
    marginTop: scale(16),
    flexDirection: 'column',
    gap: scale(8),
  },
  profileActionsGroup: {
    width: '100%',
    flexDirection: 'column',
    gap: scale(8),
    marginBottom: scale(12),
  },
  profileAction: {
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(20),
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
    borderRadius: scale(24),
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
