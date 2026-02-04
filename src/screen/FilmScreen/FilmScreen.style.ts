import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text, spacing }: Theme) => ({
  page: {
    paddingBottom: scale(16),
  },
  upperContent: {
    width: '100%',
    backgroundColor: colors.fade,
  },
  middleContent: {
    width: '100%',
    backgroundColor: colors.fade,
  },
  bottomContent: {
    width: '100%',
  },
  upperContentWrapper: {
    flexDirection: 'row',
    gap: scale(16),
    marginTop: scale(16),
  },
  upperContentInfo: {
    flex: 1,
  },
  mainContent: {
    backgroundColor: colors.background,
  },
  posterBackground: {
    position: 'absolute',
  },
  posterWrapper: {
    width: '40%',
    aspectRatio: '166 / 250',
  },
  title: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  originalTitle: {
    fontSize: scale(text.sm.fontSize),
    color: colors.textSecondary,
  },
  genres: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: scale(8),
  },
  genre: {
    backgroundColor: colors.chip,
    borderRadius: scale(8),
  },
  genreContent: {
    padding: scale(4),
  },
  backgroundGradient: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  poster: {
    height: '100%',
    width: '100%',
    borderRadius: scale(16),
  },
  mainInfo: {
  },
  rating: {
    marginTop: scale(8),
  },
  textContainer: {
    marginTop: scale(8),
    flexDirection: 'row',
  },
  textContainerNoMargin: {
    marginTop: 0,
  },
  textTitle: {
    fontSize: scale(text.xs.fontSize),
    fontWeight: '700',
  },
  text: {
    fontSize: scale(text.xs.fontSize),
  },
  collectionContainer: {
    flexDirection: 'row',
    gap: scale(2),
    rowGap: scale(4),
    marginTop: scale(8),
    flexWrap: 'wrap',
  },
  collectionTitle: {
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(text.xs.lineHeight),
    fontWeight: '700',
  },
  collectionButton: {
    borderRadius: scale(8),
    backgroundColor: colors.chip,
  },
  collectionButtonContent: {
    paddingHorizontal: scale(6),
    paddingVertical: scale(1),
  },
  collectionButtonText: {
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(text.xs.lineHeight),
    color: colors.chipText,
  },
  playBtn: {
    flex: 1,
    backgroundColor: colors.secondary,
    marginBlockStart: scale(16),
  },
  playBtnText: {
    fontSize: scale(text.xs.fontSize),
    fontWeight: '700',
  },
  downloadBtn: {
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(50),
    width: scale(40),
    height: scale(40),
  },
  downloadBtnIcon: {
  },
  middleActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: scale(16),
    gap: scale(6),
    zIndex: 10,
  },
  middleAction: {
    flex: 1,
    borderRadius: scale(50),
    padding: scale(4),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(4),
  },
  middleActionButton: {
    backgroundColor: colors.whiteTransparent,
    width: scale(44),
    height: scale(44),
    borderRadius: scale(100),
  },
  middleActionIcon: {
    margin: scale(8),
  },
  middleActionText: {
    fontSize: scale(text.xxs.fontSize),
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontSize: scale(text.sm.fontSize),
    marginTop: scale(16),
    textAlign: 'justify',
  },
  collections: {
    marginTop: scale(16),
  },
  pendingRelease: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: scale(32),
    gap: scale(8),
  },
  pendingReleaseIcon: {
    height: scale(32),
    width: scale(32),
  },
  pendingReleaseText: {
    fontSize: scale(text.sm.fontSize),
    textAlign: 'center',
  },
  section: {
    marginTop: scale(16),
    width: '100%',
  },
  sectionHeading: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  sectionHeadingWrapper: {
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
  sectionContent: {
    marginTop: scale(8),
  },
  actorsList: {
    flexDirection: 'row',
    gap: scale(16),
  },
  actor: {
    width: scale(90),
  },
  actorPhoto: {
    height: scale(130),
    borderRadius: scale(12),
  },
  actorName: {
    fontSize: scale(text.xxs.fontSize),
    textAlign: 'center',
    marginTop: scale(8),
  },
  actorJob: {
    fontSize: scale(text.xxs.fontSize),
    textAlign: 'center',
  },
  director: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    gap: scale(4),
    backgroundColor: colors.modal,
    alignItems: 'center',
    paddingInline: scale(4),
    width: '100%',
  },
  directorText: {
    fontSize: scale(text.xxs.fontSize),
  },
  visibleScheduleItems: {
  },
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
  scheduleSeason: {
    fontSize: scale(text.md.fontSize),
    padding: scale(8),
    fontWeight: '700',
    borderBottomColor: colors.secondary,
    borderBottomWidth: 1,
  },
  scheduleViewAll: {
    marginTop: scale(4),
    backgroundColor: colors.button,
  },
  franchiseList: {
  },
  franchiseItemButton: {
  },
  franchiseItemButtonContent: {
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
  franchiseItem: {
    flexDirection: 'row',
    gap: scale(12),
    paddingBlock: scale(12),
  },
  franchiseName: {
    flex: 1,
  },
  franchiseText: {
    fontSize: scale(text.xs.fontSize),
  },
  franchiseSelected: {
    color: colors.secondary,
  },
  infoListHeader: {
    fontSize: scale(text.sm.fontSize),
    paddingBottom: scale(8),
    paddingHorizontal: scale(spacing.wrapperPadding),
  },
  infoListItem: {
  },
  infoListItemContent: {
    width: '100%',
    padding: scale(8),
    paddingHorizontal: scale(spacing.wrapperPadding),
    justifyContent: 'flex-start',
  },
  infoListName: {
  },
  relatedList: {
    flexDirection: 'row',
    gap: scale(16),
  },
  commentsWrapper: {
    width: '100%',
    height: '100%',
  },
  ratings: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(16),
    marginBottom: scale(8),
  },
} satisfies ThemedStyles);
