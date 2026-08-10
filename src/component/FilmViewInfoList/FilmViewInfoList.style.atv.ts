import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  infoListContent: {
    justifyContent: 'flex-start',
  },
  infoListPressable: {
    borderRadius: scale(12),
    backgroundColor: colors.button,
    marginBottom: scale(8),
  },
  infoList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    padding: scale(12),
    width: '100%',
    borderRadius: scale(12),
  },
  infoListFocused: {
    backgroundColor: colors.backgroundFocused,
  },
  infoListName: {
    flex: 1,
    fontSize: scale(text.xs.fontSize),
  },
  infoListPosition: {
    fontSize: scale(text.xxs.fontSize),
    color: colors.textSecondary,
  },
  infoListTextFocused: {
    color: colors.textFocused,
  },
} satisfies ThemedStyles);
