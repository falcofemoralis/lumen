import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { FILM_TYPE_COLORS, TYPE_LABELS } from './FilmCard.config';
import { CARD_HEIGHT_TV, INFO_HEIGHT, ScaleAnimation, styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';

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

    return (
      <ThemedText style={[styles.typeText, { backgroundColor: FILM_TYPE_COLORS[type] }]}>
        {TYPE_LABELS[type]}
      </ThemedText>
    );
  };

  const renderInfoText = () => {
    if (!info) {
      return null;
    }

    return (
      <ThemedText style={[styles.infoText, { backgroundColor: FILM_TYPE_COLORS[type] }]}>
        {info}
      </ThemedText>
    );
  };

  return (
    <ScaleAnimation isFocused={isFocused}>
      {({ animatedScaleStyle }) => (
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
          <ThemedView.Animated
            style={[
              styles.info,
              { height: INFO_HEIGHT },
              isFocused ? styles.infoFocused : styles.info,
            ]}
          >
            <ThemedText
              style={[styles.title, isFocused ? styles.titleFocused : styles.title]}
              numberOfLines={2}
            >
              {title}
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, isFocused ? styles.subtitleFocused : styles.subtitle]}
              numberOfLines={2}
            >
              {subtitle}
            </ThemedText>
          </ThemedView.Animated>
        </ThemedView.Animated>
      )}
    </ScaleAnimation>
  );
}

export default FilmCardComponent;
