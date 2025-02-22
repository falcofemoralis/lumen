import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import Thumbnail from 'Component/Thumbnail';
import React from 'react';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { FILM_TYPE_COLORS, TYPE_LABELS } from './FilmCard.config';
import { styles } from './FilmCard.style';
import { FilmCardComponentProps } from './FilmCard.type';

export function FilmCardComponent({
  filmCard,
  isThumbnail,
  style,
}: FilmCardComponentProps) {
  const {
    type,
    poster,
    title,
    subtitle,
    info,
  } = filmCard;

  if (isThumbnail) {
    return (
      <View style={ [styles.card, { gap: scale(8) }, style] }>
        <Thumbnail style={ [styles.posterWrapper, styles.poster] } />
        <Thumbnail
          height={ scale(24) }
          width="100%"
        />
        <Thumbnail
          height={ scale(16) }
          width="50%"
        />
      </View>
    );
  }

  const renderType = () => (
    <ThemedText
      style={ [styles.typeText, { backgroundColor: FILM_TYPE_COLORS[type] }] }
    >
      { TYPE_LABELS[type] }
    </ThemedText>
  );

  const renderFilmAdditionalText = () => {
    if (!info) {
      return null;
    }

    return (
      <ThemedText
        style={ [
          styles.filmAdditionalText,
          { backgroundColor: FILM_TYPE_COLORS[type] },
        ] }
      >
        { info }
      </ThemedText>
    );
  };

  const renderPoster = () => (
    <ThemedView style={ styles.posterWrapper }>
      { renderType() }
      <ThemedImage
        style={ styles.poster }
        src={ poster }
      />
      { renderFilmAdditionalText() }
    </ThemedView>
  );

  const renderTitle = () => (
    <ThemedText
      style={ styles.title }
      numberOfLines={ 2 }
    >
      { title }
    </ThemedText>
  );

  const renderSubtitle = () => (
    <ThemedText
      style={ styles.subtitle }
      numberOfLines={ 2 }
    >
      { subtitle }
    </ThemedText>
  );

  return (
    <ThemedView style={ [styles.card, style] }>
      { renderPoster() }
      <ThemedView style={ styles.info }>
        { renderTitle() }
        { renderSubtitle() }
      </ThemedView>
    </ThemedView>
  );
}

export default FilmCardComponent;
