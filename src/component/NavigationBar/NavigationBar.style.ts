import { Theme, ThemedStyles } from 'Theme/types';

export const TAB_ADDITIONAL_SIZE = 20;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  tabBar: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  tabs: {
    width: '100%',
    flexDirection: 'row',
    height: scale(50),
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'column',
    height: scale(50) + scale(TAB_ADDITIONAL_SIZE),
    top: -scale(TAB_ADDITIONAL_SIZE) / 2,
    borderRadius: 99,
    position: 'absolute',
  },
  tab: {
    flexDirection: 'column',
    gap: scale(2),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(8),
    borderRadius: scale(99),
    opacity: 0.7,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  tabFocused: {
    opacity: 1,
  },
  tabIcon: {
  },
  tabText: {
    fontSize: scale(text.xxs.fontSize),
  },
  tabTextFocused: {
    fontWeight: 700,
  },
  tabAccount: {
    opacity: 1,
  },
  profileAvatar: {
    width: scale(22),
    height: scale(22),
    backgroundColor: colors.background,
    borderRadius: scale(99),
  },
  profileAvatarContainer: {
    borderRadius: scale(99),
    borderWidth: scale(2),
    borderColor: colors.transparent,
    transitionProperty: 'borderColor',
    transitionDuration: '150ms',
  },
  profileAvatarFocused: {
    borderColor: colors.backgroundFocused,
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
    right: -scale(8),
    top: -scale(8),
    color: colors.textOnContrast,
  },
} satisfies ThemedStyles);
