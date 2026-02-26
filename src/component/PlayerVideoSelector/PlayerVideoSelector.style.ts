import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  background: {
  },
  container: {
  },
  voicesContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(4),
  },
  voicesDropdown: {
    flex: 1,
  },
  seasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(4),
    marginTop: scale(8),
  },
  season: {
    backgroundColor: colors.chip,
    borderRadius: scale(16),
  },
  seasonContent: {
    padding: scale(8),
  },
  seasonSelected: {
    backgroundColor: colors.primary,
  },
  seasonText: {
    color: colors.chipText,
  },
  seasonTextSelected: {
    color: colors.textOnTertiary,
  },
  episodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(4),
    marginTop: scale(8),
    paddingTop: scale(8),
    borderTopWidth: scale(2),
    borderTopColor: colors.divider,
  },
  episodesContainerNoBorder: {
    borderTopWidth: 0,
  },
  episode: {
    backgroundColor: colors.chip,
    borderRadius: scale(16),
  },
  episodeContent: {
    padding: scale(8),
  },
  episodeSelected: {
    backgroundColor: colors.primary,
  },
  episodeDownloadSelected: {
    backgroundColor: colors.secondary,
  },
  episodeText: {
  },
  episodeTextSelected: {
    color: colors.textOnTertiary,
  },
  playContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playBtn: {
    margin: scale(8),
  },
  voiceDropdownInput: {
    flex: 1,
  },
  buttonProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonProgressOutline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scale(18),
    borderWidth: scale(2),
    borderColor: '#0283d1',
    backgroundColor: colors.transparent,
  },
  buttonProgressMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.chip,
  },
  downloadBtn: {
    marginTop: scale(12),
    backgroundColor: colors.backgroundLighter,
  },
  empty: {
    height: scale(150),
    justifyContent: 'center',
    alignItems: 'center',
  },
} satisfies ThemedStyles);
