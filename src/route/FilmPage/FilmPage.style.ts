import { Colors } from 'Style/Colors';
import { CONTENT_WRAPPER_PADDING } from 'Style/Layout';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  page: {
    paddingBottom: 16,
  },
  upperContent: {
    width: '100%',
    backgroundColor: Colors.fade,
  },
  middleContent: {
    width: '100%',
    backgroundColor: Colors.fade,
  },
  bottomContent: {
    width: '100%',
  },
  upperContentWrapper: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  upperContentInfo: {
    flex: 1,
  },
  mainContent: {
    backgroundColor: Colors.background,
  },
  posterBackground: {
    aspectRatio: '166 / 250',
    width: '100%',
    position: 'absolute',
  },
  posterWrapper: {
    width: '40%',
    aspectRatio: '166 / 250',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  originalTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  genres: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  genre: {
    backgroundColor: Colors.chip,
    borderRadius: 8,
  },
  genreContent: {
    padding: 4,
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
    borderRadius: 16,
  },
  mainInfo: {
  },
  rating: {
    marginTop: 8,
  },
  textContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  textContainerNoMargin: {
    marginTop: 0,
  },
  textTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
  },
  collectionContainer: {
    flexDirection: 'row',
    gap: 2,
    rowGap: 4,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  collectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  collectionButton: {
    borderRadius: 8,
    backgroundColor: Colors.chip,
  },
  collectionButtonContent: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  collectionButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.chipText,
  },
  playBtn: {
    flex: 1,
    backgroundColor: Colors.secondary,
    marginBlockStart: 16,
  },
  playBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  downloadBtn: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 50,
    width: 40,
    height: 40,
  },
  downloadBtnIcon: {
  },
  middleActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 16,
    gap: 6,
    zIndex: 10,
  },
  middleAction: {
    flex: 1,
    borderRadius: 50,
    padding: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  middleActionButton: {
    backgroundColor: Colors.whiteTransparent,
    width: 44,
    height: 44,
    borderRadius: 100,
  },
  middleActionIcon: {
    margin: 8,
  },
  middleActionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'justify',
  },
  collections: {
    marginTop: 16,
  },
  pendingRelease: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 32,
    gap: 8,
  },
  pendingReleaseIcon: {
    height: 32,
    width: 32,
  },
  pendingReleaseText: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    width: '100%',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeadingWrapper: {
    paddingHorizontal: CONTENT_WRAPPER_PADDING,
  },
  sectionContent: {
    marginTop: 8,
  },
  actorsList: {
    flexDirection: 'row',
    gap: 16,
  },
  actor: {
    width: 90,
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
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    padding: 12,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
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
  scheduleItemEpisodeName: {
  },
  scheduleItemEpisodeOgName: {
  },
  scheduleItemReleaseDate: {
    textAlign: 'center',
  },
  scheduleItemMarkIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    borderRadius: 100,
  },
  scheduleSeason: {
    fontSize: 18,
    padding: 8,
    fontWeight: '700',
    borderBottomColor: Colors.secondary,
    borderBottomWidth: 1,
  },
  scheduleViewAll: {
    marginTop: 4,
    backgroundColor: Colors.button,
  },
  franchiseList: {
  },
  franchiseItemButton: {
  },
  franchiseItemButtonContent: {
    paddingHorizontal: CONTENT_WRAPPER_PADDING,
  },
  franchiseItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBlock: 12,
  },
  franchiseName: {
    flex: 1,
  },
  franchiseText: {
    fontSize: 14,
  },
  franchiseSelected: {
    color: Colors.secondary,
  },
  infoListHeader: {
    fontSize: 16,
    paddingBottom: 8,
    paddingHorizontal: CONTENT_WRAPPER_PADDING,
  },
  infoListItem: {
  },
  infoListItemContent: {
    width: '100%',
    padding: 8,
    paddingHorizontal: CONTENT_WRAPPER_PADDING,
    justifyContent: 'flex-start',
  },
  infoListName: {
  },
  relatedList: {
    flexDirection: 'row',
    gap: 16,
  },
  commentsWrapper: {
    width: '100%',
    height: '100%',
  },
  ratings: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  featuredRating: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  featuredRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.black,
    backgroundColor: 'yellow',
    padding: 4,
    borderRadius: 16,
  },
});
