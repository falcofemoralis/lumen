import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text, spacing }: Theme) => ({
  setting: {
  },
  settingHidden: {
    opacity: 0.5,
  },
  settingContainer: {
    justifyContent: 'flex-start',
    paddingHorizontal: scale(spacing.wrapperPadding),
    paddingVertical: scale(12),
  },
  settingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    flex: 1,
  },
  settingContent: {
    width: 'auto',
    maxWidth: '90%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  settingIcon: {
  },
  settingTitle: {
    fontSize: scale(text.xs.fontSize),
  },
  settingSubtitle: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
    opacity: 0.8,
  },
} satisfies ThemedStyles);
