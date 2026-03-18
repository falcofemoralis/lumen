import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text, spacing }: Theme) => ({
  setting: {
    width: '100%',
  },
  settingHidden: {
    opacity: 0.5,
  },
  settingContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    paddingHorizontal: scale(spacing.wrapperPadding),
    paddingVertical: scale(12),
  },
  settingIcon: {
    flexShrink: 0,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  settingTitle: {
    fontSize: scale(text.xs.fontSize),
  },
  settingSubtitle: {
    fontSize: scale(text.xs.fontSize),
    color: colors.textSecondary,
    opacity: 0.8,
  },
  settingAdditionalElement: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loaderContainer: {
    transform: [{ translateX: '-50%' }],
  },
} satisfies ThemedStyles);
