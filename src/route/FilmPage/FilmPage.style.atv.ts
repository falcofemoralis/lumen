import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 14,
  },
  actionButtonIcon: {
  },
  mainContent: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    paddingBlockStart: 32,
  },
  poster: {
    width: '30%',
    aspectRatio: '166 / 250',
    borderRadius: 16,
  },
  mainInfo: {
    padding: 16,
    flexShrink: 1,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  originalTitle: {
    fontSize: 16,
    lineHeight: 16,
    color: Colors.lightGray,
    opacity: 0.6,
    marginTop: 4,
  },
  additionalInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  rating: {
    marginTop: 8,
  },
  ratingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  textContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  textTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  collectionContainer: {
    marginTop: 8,
    gap: 6,
    flexDirection: 'row',
  },
  collectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  collection: {
    flexDirection: 'row',
    gap: 10,
  },
  collectionButton: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  collectionButtonText: {
    fontSize: 12,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    marginTop: 8,
    textAlign: 'justify',
  },
  section: {
    marginTop: 16,
    padding: 16,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionContent: {
    marginTop: 8,
  },
  actorsListWrapper: {
    flexDirection: 'row',
  },
  actorsList: {
    flexDirection: 'row',
    gap: 10,
  },
  actor: {
    width: 90,
    borderRadius: 12,
    paddingBottom: 4,
  },
  actorFocused: {
    backgroundColor: Colors.white,
  },
  actorPhoto: {
    height: 130,
    borderRadius: 12,
  },
  actorName: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  actorJob: {
    fontSize: 12,
    textAlign: 'center',
  },
  actorNameFocused: {
    color: Colors.black,
  },
  director: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.modal,
    alignItems: 'center',
    paddingInline: 4,
    width: '100%',
  },
  directorText: {
    fontSize: 12,
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
    gap: 8,
    padding: 16,
    borderRadius: 16,
  },
  scheduleItemFocused: {
    backgroundColor: Colors.white,
  },
  scheduleItemEven: {
    backgroundColor: Colors.darkGray,
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
    width: 48,
    justifyContent: 'center',
  },
  scheduleItemText: {
    fontSize: 14,
  },
  scheduleItemTextFocused: {
    color: Colors.black,
  },
  scheduleItemEpisodeName: {
  },
  scheduleItemEpisodeOgName: {
  },
  scheduleItemReleaseDate: {
    textAlign: 'center',
  },
  scheduleItemMarkIcon: {
    width: 32,
    alignSelf: 'center',
  },
  scheduleSeason: {
    fontSize: 20,
    padding: 8,
    fontWeight: '700',
    borderBottomColor: Colors.secondary,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  scheduleViewAll: {
    marginTop: 16,
    width: '25%',
  },
  scheduleOverlay: {
    width: '50%',
    height: '90%',
  },
  scheduleOverlayContent: {
    flexDirection: 'row',
    height: '100%',
  },
  franchiseList: {
  },
  franchiseItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBlock: 12,
    paddingInline: 8,
  },
  franchiseItemFocused: {
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  franchiseName: {
    flex: 1,
  },
  franchiseText: {
    fontSize: 14,
  },
  franchiseTextFocused: {
    color: Colors.black,
  },
  franchiseSelected: {
    color: Colors.secondary,
  },
  infoList: {
    padding: 8,
    borderRadius: 8,
  },
  infoListEven: {
    backgroundColor: Colors.darkGray,
  },
  infoListFocused: {
    backgroundColor: Colors.white,
  },
  infoListName: {
  },
  infoListNameFocused: {
    color: Colors.black,
  },
  relatedListWrapper: {
    flexDirection: 'row',
  },
  relatedList: {
    flexDirection: 'row',
    gap: 16,
    paddingBlock: 16,
  },
  relatedListItem: {
    flex: 0,
    width: 100,
  },
  relatedListItemPoster: {
    height: 160,
  },
  commentsOverlay: {
    width: '50%',
    height: '100%',
  },
  commentsOverlayContent: {
    height: '100%',
  },
});
