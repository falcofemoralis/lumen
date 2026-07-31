import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  infoListContent: {
    justifyContent: 'flex-start',
    borderRadius: scale(8),
  },
  infoList: {
    padding: scale(8),
    width: '100%',
  },
  infoListFocused: {
    borderRadius: scale(8),
    backgroundColor: colors.backgroundFocused,
  },
  infoListName: {
  },
  infoListNameFocused: {
    color: colors.textFocused,
  },
} satisfies ThemedStyles);
