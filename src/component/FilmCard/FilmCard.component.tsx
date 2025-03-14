import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React from 'react';
import { View } from 'react-native';

import { FILM_TYPE_COLORS, TYPE_LABELS } from './FilmCard.config';
import { styles } from './FilmCard.style';
import { FilmCardComponentProps } from './FilmCard.type';

export function FilmCardComponent({
  filmCard,
  style,
}: FilmCardComponentProps) {
  const {
    type,
    poster,
    title,
    subtitle,
    info,
  } = filmCard;

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
    <View style={ styles.posterWrapper }>
      { renderType() }
      <ThemedImage
        style={ styles.poster }
        src={ poster }
      />
      { renderFilmAdditionalText() }
    </View>
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
