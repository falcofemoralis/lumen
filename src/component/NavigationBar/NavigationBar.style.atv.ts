import { Theme, ThemedStyles } from 'Theme/types';

export const NAVIGATION_BAR_Z_INDEX = 100;
export const NAVIGATION_BAR_TV_WIDTH = 68;
export const NAVIGATION_BAR_TV_WIDTH_PADDING = 12;

export const NAVIGATION_BAR_TV_TAB_WIDTH = NAVIGATION_BAR_TV_WIDTH - NAVIGATION_BAR_TV_WIDTH_PADDING * 2;
export const NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED = 120;

export const NAVIGATION_BAR_ANIMATION_DURATION_MS = 300;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  bar: {
    left: 0,
    top: 0,
    width: scale(NAVIGATION_BAR_TV_WIDTH),
    height: '100%',
    paddingHorizontal: scale(NAVIGATION_BAR_TV_WIDTH_PADDING),
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: NAVIGATION_BAR_Z_INDEX,
    transitionProperty: 'width',
    transitionDuration: `${NAVIGATION_BAR_ANIMATION_DURATION_MS}ms`,
    transitionTimingFunction: 'ease-in-out',
    backgroundColor: colors.background,
  },
  barOpened: {
    width: scale(NAVIGATION_BAR_TV_TAB_WIDTH) + scale(NAVIGATION_BAR_TV_TAB_WIDTH_EXPANDED),
  },
  tabs: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    overflow: 'hidden',
    zIndex: NAVIGATION_BAR_Z_INDEX + 2,
  },
  tab: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: scale(12),
    borderRadius: scale(24),
    marginBottom: scale(12),
  },
  tabSelected: {
    backgroundColor: colors.tertiary,
    borderRadius: scale(24),
  },
  tabFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(24),
  },
  tabIcon: {
    width: scale(20),
    height: scale(20),
    opacity: 1,
  },
  tabText: {
    display: 'flex',
    position: 'absolute',
    left: scale(44),
    color: colors.text,
    fontSize: scale(text.xs.fontSize),
  },
  tabContentFocused: {
    color: colors.textFocused,
  },
  profile: {
    height: scale(32),
  },
  profileNameText: {
    left: scale(8),
    top: scale(-2),
    fontWeight: 'bold',
  },
  profileSwitchText: {
    left: scale(8),
    bottom: scale(-2),
    color: colors.textSecondary,
  },
  profileAvatarContainer: {
    left: scale(-6),
  },
  profileAvatar: {
    width: scale(32),
    height: scale(32),
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(99),
    borderColor: colors.border,
    borderWidth: 1,
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
    right: scale(-8),
    top: scale(-8),
    color: colors.textOnContrast,
  },
} satisfies ThemedStyles);
