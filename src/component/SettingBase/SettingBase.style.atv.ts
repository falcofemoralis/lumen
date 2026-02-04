import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  setting: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    backgroundColor: colors.transparent,
    minHeight: scale(64),
    justifyContent: 'center',
    borderRadius: scale(16),
  },
  settingFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(16),
  },
  settingHidden: {
    opacity: 0.5,
  },
  settingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  settingContent: {
    width: 'auto',
    maxWidth: '90%',
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
  },
} satisfies ThemedStyles);
