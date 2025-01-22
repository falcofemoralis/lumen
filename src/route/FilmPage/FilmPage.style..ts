import Colors from 'Style/Colors';
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
    width: 32,
    margin: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  originalTitle: {
    fontSize: 16,
    color: Colors.lightGray,
  },
  genres: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  genre: {
    backgroundColor: Colors.gray,
    borderRadius: 8,
    padding: 4,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  poster: {
    width: '40%',
    aspectRatio: '166 / 250',
    borderRadius: 16,
  },
  mainInfo: {
    marginTop: -8,
    justifyContent: 'flex-start',
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
    width: '75%',
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
    backgroundColor: Colors.gray,
  },
  collectionButtonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    gap: 8,
  },
  quickInfoTextWrapper: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickInfoUpperText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '700',
  },
  quickInfoLowerText: {
    fontSize: 16,
    color: Colors.white,
  },
  playBtn: {
    width: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    color: Colors.white,
    fontSize: 16,
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
    backgroundColor: Colors.gravel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.lightGravel,
    padding: 8,
  },
  actionIcon: {

  },
  actionText: {

  },
  description: {
    color: Colors.lightGray,
    fontSize: 16,
    marginTop: 16,
  },
  collections: {
    marginTop: 16,
  },
});
