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
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  collectionContainer: {
    marginTop: 8,
    gap: 6,
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
  },
});
