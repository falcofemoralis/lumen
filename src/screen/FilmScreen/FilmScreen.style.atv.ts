import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  page: {
    paddingBottom: scale(16),
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(10),
    marginTop: scale(8),
  },
  actionButton: {
    paddingVertical: scale(10),
  },
  actionButtonText: {
    fontSize: scale(text.xs.fontSize),
  },
  actionButtonIcon: {
  },
  mainContent: {
    flexDirection: 'row',
    gap: scale(24),
    width: '100%',
    paddingBlockStart: scale(32),
  },
  poster: {
    width: '30%',
    aspectRatio: '166 / 250',
    borderRadius: scale(16),
  },
  mainInfo: {
    padding: scale(16),
    flexShrink: 1,
  },
  title: {
    fontSize: scale(text.xl.fontSize),
    lineHeight: scale(text.xl.lineHeight),
    fontWeight: '700',
    color: colors.text,
  },
  originalTitle: {
    fontSize: scale(text.sm.fontSize),
    lineHeight: scale(text.sm.lineHeight),
    color: colors.textSecondary,
    opacity: 0.6,
    marginTop: scale(4),
  },
  additionalInfo: {
    flexDirection: 'row',
    gap: scale(16),
  },
  rating: {
    marginTop: scale(8),
  },
  ratingStar: {
    marginHorizontal: scale(2),
  },
  ratingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  textContainer: {
    marginTop: scale(8),
    flexDirection: 'row',
  },
  textTitle: {
    fontSize: scale(text.xs.fontSize),
    fontWeight: '700',
    lineHeight: scale(text.xs.lineHeight),
  },
  text: {
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(text.xs.lineHeight),
    opacity: 0.8,
  },
  collectionContainer: {
    marginTop: scale(8),
    gap: scale(10),
    flexDirection: 'row',
  },
  collectionTitle: {
    fontSize: scale(text.xs.fontSize),
    fontWeight: '700',
    lineHeight: scale(text.xs.lineHeight),
  },
  collection: {
    flexDirection: 'row',
    gap: scale(10),
  },
  collectionButton: {
    borderRadius: scale(8),
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    backgroundColor: colors.chip,
  },
  collectionButtonText: {
    fontSize: scale(text.xxs.fontSize),
    lineHeight: scale(text.xxs.lineHeight),
  },
  description: {
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(text.xs.lineHeight),
    marginTop: scale(8),
    textAlign: 'justify',
  },
  readMoreButton: {
    flexDirection: 'row',
    marginTop: scale(8),
  },
  readMoreButtonHidden: {
    display: 'none',
  },
  section: {
    marginTop: scale(16),
    padding: scale(16),
  },
  sectionHeading: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  sectionContent: {
    marginTop: scale(8),
  },
  actorsListWrapper: {
    flexDirection: 'row',
  },
  actorsList: {
    flexDirection: 'row',
    gap: scale(10),
  },
  actor: {
    width: scale(90),
    paddingBottom: scale(4),
  },
  actorFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(12),
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
  actorNameFocused: {
    color: colors.textFocused,
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
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(text.xs.lineHeight),
  },
  visibleScheduleItems: {
    flexDirection: 'row',
  },
  scheduleItems: {
  },
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
  scheduleSeason: {
    fontSize: scale(text.lg.fontSize),
    padding: scale(8),
    fontWeight: '700',
    borderBottomColor: colors.secondary,
    borderBottomWidth: 1,
    marginBottom: scale(4),
  },
  scheduleViewAll: {
    marginTop: scale(4),
    width: '35%',
  },
  scheduleOverlay: {
    width: '50%',
  },
  scheduleOverlayContent: {
    flexDirection: 'row',
  },
  scheduleAccordionOverlay: {
    flexGrow: 1,
  },
  franchiseList: {
  },
  franchiseItem: {
    flexDirection: 'row',
    gap: scale(12),
    paddingBlock: scale(12),
    paddingInline: scale(8),
  },
  franchiseItemFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(8),
  },
  franchiseName: {
    flex: 1,
  },
  franchiseText: {
    fontSize: scale(text.xs.fontSize),
  },
  franchiseTextFocused: {
    color: colors.textFocused,
  },
  franchiseSelected: {
    color: colors.secondary,
  },
  infoList: {
    padding: scale(8),
  },
  infoListFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(8),
  },
  infoListName: {
  },
  infoListNameFocused: {
    color: colors.textFocused,
  },
  infoListAccordionOverlay: {
    flex: 0,
  },
  relatedListWrapper: {
    flexDirection: 'row',
  },
  relatedList: {
    flexDirection: 'row',
    gap: scale(16),
    paddingBlock: scale(12),
    paddingHorizontal: scale(6),
  },
  relatedListItem: {
    flex: 0,
    width: scale(100),
  },
  relatedListItemPoster: {
  },
  commentsOverlay: {
    width: '50%',
    height: '100%',
  },
  commentsOverlayContent: {
    height: '100%',
  },
  descriptionOverlay: {
    width: '80%',
  },
  descriptionOverlayText: {
    fontSize: scale(text.sm.fontSize),
    lineHeight: scale(text.sm.lineHeight),
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(16),
    borderColor: colors.darkBorder,
    borderWidth: 1,
  },
  actorsCollection: {
    flexDirection: 'row',
    gap: scale(10),
    paddingBlock: scale(12),
    paddingHorizontal: scale(6),
  },
} satisfies ThemedStyles);