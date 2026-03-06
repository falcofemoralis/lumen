import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  setting: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    backgroundColor: colors.transparent,
    minHeight: scale(64),
    justifyContent: 'center',
    borderRadius: scale(16),
    width: '100%',
  },
  settingFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(16),
  },
  settingHidden: {
    opacity: 0.5,
  },
  settingWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  settingContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  settingTitle: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
  },
  settingTitleFocused: {
    color: colors.textFocused,
  },
  settingSubtitle: {
    fontSize: scale(text.sm.fontSize),
    color: colors.textSecondary,
    opacity: 0.8,
  },
  settingSubtitleFocused: {
    color: colors.textFocused,
  },
  settingIcon: {
    flexShrink: 0,
  },
  settingAdditionalElement: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
} satisfies ThemedStyles);
