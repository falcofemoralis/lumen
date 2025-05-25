import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    width: '100%',
  },
  topActionsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    padding: 12,
    borderRadius: 100,
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
    padding: 4,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  posterWrapper: {
    width: '40%',
    aspectRatio: '166 / 250',
    borderRadius: 16,
  },
  poster: {
    height: '100%',
    width: '100%',
    borderRadius: 16,
  },
  mainInfo: {
    marginTop: -8,
    justifyContent: 'flex-start',
    width: '55%',
  },
  rating: {
    marginTop: 8,
  },
  textContainer: {
    marginTop: 8,
    flexDirection: 'row',
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
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: Colors.chip,
  },
  collectionButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.chipText,
  },
  playBtn: {
    width: '100%',
    backgroundColor: Colors.secondary,
    marginBlockStart: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 16,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
  },
  actionIcon: {

  },
  actionText: {

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
    padding: 8,
    borderRadius: 16,
  },
  scheduleItemEven: {
    backgroundColor: Colors.background,
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
    width: 32,
    alignSelf: 'center',
  },
  scheduleSeason: {
    fontSize: 18,
    padding: 8,
    fontWeight: '700',
    borderBottomColor: Colors.secondary,
    borderBottomWidth: 1,
  },
  scheduleViewAll: {
    marginTop: 16,
    backgroundColor: Colors.button,
  },
  franchiseList: {
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
  },
  infoList: {
    padding: 8,
    borderRadius: 8,
  },
  infoListEven: {
    backgroundColor: Colors.background,
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
});
