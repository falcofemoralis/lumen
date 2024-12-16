import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { Animated } from 'react-native';
import { FILM_TYPE_COLORS, TYPE_LABELS } from './FilmCard.config';
import { CARD_HEIGHT_TV, INFO_HEIGHT, styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';
import { useFocusAnimation } from './useFocusAnimation';

export function FilmCardComponent(props: FilmCardComponentProps) {
  const { filmCard, style, isFocused = false, isThumbnail } = props;
  const { type, poster, title, subtitle, info } = filmCard;

  const scaleAnimation = useFocusAnimation(isFocused);

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

  const renderFilmAdditionalText = () => {
    if (!info) {
      return null;
    }

    return (
      <ThemedText
        style={[
          styles.filmAdditionalText,
          { backgroundColor: FILM_TYPE_COLORS[type] },
          isFocused && styles.posterFocused,
        ]}
      >
        {info}
      </ThemedText>
    );
  };

  const renderPoster = () => {
    return (
      <ThemedView style={{ height: CARD_HEIGHT_TV - INFO_HEIGHT }}>
        {renderType()}
        <ThemedImage
          style={[styles.poster, isFocused && styles.posterFocused]}
          src={poster}
        />
        {renderFilmAdditionalText()}
      </ThemedView>
    );
  };

  const renderTitle = () => {
    return (
      <ThemedText
        style={[styles.title, isFocused ? styles.titleFocused : styles.title]}
        numberOfLines={2}
      >
        {title}
      </ThemedText>
    );
  };

  const renderSubtitle = () => {
    return (
      <ThemedText
        style={[styles.subtitle, isFocused ? styles.subtitleFocused : styles.subtitle]}
        numberOfLines={2}
      >
        {subtitle}
      </ThemedText>
    );
  };

  return (
    <Animated.View style={[styles.card, { height: CARD_HEIGHT_TV }, scaleAnimation, style]}>
      {renderPoster()}
      <ThemedView
        style={[styles.info, { height: INFO_HEIGHT }, isFocused ? styles.infoFocused : styles.info]}
      >
        {renderTitle()}
        {renderSubtitle()}
      </ThemedView>
    </Animated.View>
  );
}

export default FilmCardComponent;
