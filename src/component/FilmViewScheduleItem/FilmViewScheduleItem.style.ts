import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: scale(8),
    padding: scale(12),
    marginVertical: scale(4),
    borderRadius: scale(16),
    backgroundColor: colors.backgroundLight,
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
    width: scale(48),
    justifyContent: 'center',
  },
  scheduleItemText: {
    fontSize: scale(text.xs.fontSize),
  },
  scheduleItemEpisodeName: {
  },
  scheduleItemEpisodeOgName: {
  },
  scheduleItemReleaseDate: {
    textAlign: 'center',
  },
  scheduleItemMarkIcon: {
    width: scale(40),
    height: scale(40),
    alignSelf: 'center',
    borderRadius: scale(100),
  },
} satisfies ThemedStyles);
