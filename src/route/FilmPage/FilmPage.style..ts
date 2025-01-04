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
  mainContent: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  poster: {
    width: '40%',
    aspectRatio: '166 / 250',
    borderRadius: 16,
  },
  mainInfo: {
    width: '55%',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  originalTitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  rating: {

  },
  textContainer: {
    marginTop: 8,
  },
  text: {
    fontSize: 14,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  collectionContainer: {
    marginTop: 8,
    gap: 6,
  },
  collectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  collection: {
    flexDirection: 'row',
    gap: 10,
  },
  collectionButton: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.gray,
  },
  collectionButtonText: {
    fontSize: 12,
    lineHeight: 20,
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
});
