import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: scale(8),
    padding: scale(16),
    marginVertical: scale(4),
    borderRadius: scale(16),
    backgroundColor: colors.button,
  },
  scheduleItemFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(16),
  },
  scheduleItemInfoWrapper: {
    flexDirection: 'column',
    flex: 1,
  },
  scheduleItemEpisodeWrapper: {
    flexDirection: 'column',
  },
  scheduleItemNameWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleItemReleaseWrapper: {
    width: scale(80),
    justifyContent: 'center',
  },
  scheduleItemText: {
    fontSize: scale(text.xs.fontSize),
  },
  scheduleItemTextFocused: {
    color: colors.textFocused,
  },
  scheduleItemEpisodeName: {
  },
  scheduleItemEpisodeOgName: {
  },
  scheduleItemReleaseDate: {
    textAlign: 'center',
  },
  scheduleItemMarkIcon: {
    width: scale(32),
    alignSelf: 'center',
  },
} satisfies ThemedStyles);
