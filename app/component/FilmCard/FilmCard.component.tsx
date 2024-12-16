import ThemedText from 'Component/ThemedText';
import { FilmCardComponentProps } from './FilmCard.type';
import { styles } from './FilmCard.style';
import ThemedView from 'Component/ThemedView';
import ThemedImage from 'Component/ThemedImage';
import { FILM_TYPE_COLORS, TYPE_LABELS } from './FilmCard.config';

export function FilmCardComponent(props: FilmCardComponentProps) {
  const { filmCard, isThumbnail, style } = props;
  const { type, poster, title, subtitle, info } = filmCard;

  if (isThumbnail) {
    return <ThemedView style={[styles.card, styles.cardThumbnail, style]} />;
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
      <ThemedText style={[styles.filmAdditionalText, { backgroundColor: FILM_TYPE_COLORS[type] }]}>
        {info}
      </ThemedText>
    );
  };

  const renderPoster = () => {
    return (
      <ThemedView style={styles.posterWrapper}>
        {renderType()}
        <ThemedImage
          style={styles.poster}
          src={poster}
        />
        {renderFilmAdditionalText()}
      </ThemedView>
    );
  };

  const renderTitle = () => {
    return (
      <ThemedText
        style={styles.title}
        numberOfLines={2}
      >
        {title}
      </ThemedText>
    );
  };

  const renderSubtitle = () => {
    return (
      <ThemedText
        style={styles.subtitle}
        numberOfLines={2}
      >
        {subtitle}
      </ThemedText>
    );
  };

  return (
    <ThemedView style={styles.card}>
      {renderPoster()}
      <ThemedView style={styles.info}>
        {renderTitle()}
        {renderSubtitle()}
      </ThemedView>
    </ThemedView>
  );
}

export default FilmCardComponent;
