import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  containerSeasons: {
    maxHeight: scale(300),
  },
  containerVoices: {
    maxHeight: '100%',
  },
  voicesInput: {
    marginBottom: scale(10),
  },
  episodesContainer: {
    borderTopWidth: scale(2),
    borderTopColor: colors.border,
    paddingTop: scale(8),
  },
  episodesContainerNoBorder: {
    borderTopWidth: 0,
  },
  row: {
    flexDirection: 'row',
    marginBottom: scale(10),
  },
  button: {
    marginEnd: scale(10),
    marginBottom: scale(10),
    borderRadius: scale(99),
  },
  season: {
    backgroundColor: colors.chip,
    borderRadius: scale(16),
    marginEnd: scale(10),
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
  episode: {
    backgroundColor: colors.chip,
    borderRadius: scale(16),
    marginEnd: scale(10),
  },
  episodeContent: {
    padding: scale(8),
  },
  episodeSelected: {
    backgroundColor: colors.primary,
  },
  episodeText: {
  },
  episodeTextSelected: {
    color: colors.textOnTertiary,
  },
  voicesWrapper: {
    width: '100%',
    minWidth: scale(288),
    maxHeight: scale(288),
    flexDirection: 'row',
    gap: scale(4),
  },
  voicesContainer: {
    flex: 1,
  },
  compactSelectorsContainer: {
    width: '100%',
    gap: scale(10),
    marginTop: scale(10),
  },
  compactSelector: {
    width: '100%',
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
  buttonProgressMaskSelected: {
    backgroundColor: colors.primary,
  },
  episodeDownloadSelected: {
    backgroundColor: colors.secondary,
  },
  downloadBtn: {
    marginBottom: scale(12),
    backgroundColor: colors.backgroundLighter,
  },
  empty: {
    height: scale(150),
    justifyContent: 'center',
    alignItems: 'center',
  },
} satisfies ThemedStyles);
