import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  page: {
    marginTop: scale(8),
  },
  actionsWrapper: {
    height: scale(44),
    zIndex: 10,
  },
  actionsWrapperCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    gap: scale(8),
    marginTop: scale(4),
  },
  actionButtonText: {
    fontSize: scale(text.xs.fontSize),
  },
  mainContent: {
    flexDirection: 'row',
    gap: scale(24),
    width: '100%',
    paddingBlockStart: scale(16),
  },
  poster: {
    width: '30%',
    aspectRatio: `${POSTER_ASPECT_WIDTH} / ${POSTER_ASPECT_HEIGHT}`,
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
    backgroundColor: colors.chip,
  },
  collectionButtonContent: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
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
  actorsListWrapper: {
    flexDirection: 'row',
  },
  scheduleListWrapper: {
    height: 'auto',
  },
  scheduleViewAll: {
    marginTop: scale(4),
    width: '35%',
  },
  relatedList: {
    flexDirection: 'row',
    gap: scale(16),
  },
  commentsOverlay: {
    width: '50%',
    height: '100%',
    // overrides the overlay's default maxHeight, which would clamp it to half the screen
    maxHeight: '100%',
  },
  commentsOverlayContent: {
    height: '100%',
  },
  descriptionOverlay: {
    width: '80%',
    maxHeight: '100%',
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
  },
  actionButton: {
    backgroundColor: colors.transparent,
    borderRadius: scale(99),
  },
} satisfies ThemedStyles);