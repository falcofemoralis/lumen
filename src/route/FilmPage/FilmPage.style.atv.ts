import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  page: {
    paddingBottom: 16,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 4,
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
    color: Colors.text,
  },
  originalTitle: {
    fontSize: 16,
    lineHeight: 16,
    color: Colors.textSecondary,
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
  ratingStar: {
    marginHorizontal: 2,
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
    backgroundColor: Colors.chip,
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
  readMoreButton: {
    flexDirection: 'row',
    marginTop: 8,
  },
  readMoreButtonHidden: {
    display: 'none',
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
    paddingBottom: 4,
  },
  actorFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 12,
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
    color: Colors.textFocused,
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
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: Colors.button,
  },
  scheduleItemFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 16,
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
    color: Colors.textFocused,
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
    marginTop: 4,
    width: '25%',
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
    gap: 12,
    paddingBlock: 12,
    paddingInline: 8,
  },
  franchiseItemFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 8,
  },
  franchiseName: {
    flex: 1,
  },
  franchiseText: {
    fontSize: 14,
  },
  franchiseTextFocused: {
    color: Colors.textFocused,
  },
  franchiseSelected: {
    color: Colors.secondary,
  },
  infoList: {
    padding: 8,
  },
  infoListFocused: {
    backgroundColor: Colors.backgroundFocused,
    borderRadius: 8,
  },
  infoListName: {
  },
  infoListNameFocused: {
    color: Colors.textFocused,
  },
  infoListAccordionOverlay: {
    flex: 0,
  },
  relatedListWrapper: {
    flexDirection: 'row',
  },
  relatedList: {
    flexDirection: 'row',
    gap: 16,
    paddingBlock: 12,
    paddingHorizontal: 6,
  },
  relatedListItem: {
    flex: 0,
    width: 100,
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
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    borderColor: Colors.darkBorder,
    borderWidth: 1,
  },
  actorsCollection: {
    flexDirection: 'row',
    gap: 10,
    paddingBlock: 12,
    paddingHorizontal: 6,
  },
});
