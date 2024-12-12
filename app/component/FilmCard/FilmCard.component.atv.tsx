import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { CARD_HEIGHT_TV, FocusedAnimation, INFO_HEIGHT, styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';
import { FilmType } from 'Type/FilmType.type';

const TYPE_LABELS = {
  [FilmType.Film]: 'Movie',
  [FilmType.Series]: 'Series',
  [FilmType.Multfilm]: 'Cartoon',
  [FilmType.Anime]: 'Anime',
  [FilmType.TVShow]: 'TV Show',
};

export function FilmCardComponent(props: FilmCardComponentProps) {
  const { filmCard, style, isFocused, isThumbnail } = props;
  const { type, poster, title, subtitle, info } = filmCard;

  if (isThumbnail) {
    return (
      <ThemedView style={[styles.card, { height: CARD_HEIGHT_TV }, styles.cardThumbnail, style]} />
    );
  }

  const renderType = () => {
    if (!type) {
      return null;
    }

    return <ThemedText style={styles.typeText}>{TYPE_LABELS[type]}</ThemedText>;
  };

  const renderInfoText = () => {
    if (!info) {
      return null;
    }

    return <ThemedText style={styles.infoText}>{info}</ThemedText>;
  };

  return (
    <FocusedAnimation isFocused={isFocused}>
      {({ animatedScaleStyle, animatedInfoStyle, animatedTitleStyle, animatedSubtitleStyle }) => (
        <ThemedView.Animated
          style={[styles.card, { height: CARD_HEIGHT_TV }, animatedScaleStyle, style]}
        >
          <ThemedView style={(styles.posterWrapper, { height: CARD_HEIGHT_TV - INFO_HEIGHT })}>
            {renderType()}
            <ThemedImage
              style={styles.poster}
              src={poster}
            />
            {renderInfoText()}
          </ThemedView>
          <ThemedView.Animated style={[styles.info, { height: INFO_HEIGHT }, animatedInfoStyle]}>
            <ThemedText.Animated
              style={[styles.title, animatedTitleStyle, style]}
              numberOfLines={2}
            >
              {title}
            </ThemedText.Animated>
            <ThemedText.Animated
              style={[styles.subtitle, animatedSubtitleStyle]}
              numberOfLines={2}
            >
              {subtitle}
            </ThemedText.Animated>
          </ThemedView.Animated>
        </ThemedView.Animated>
      )}
    </FocusedAnimation>
  );
}

export default FilmCardComponent;
