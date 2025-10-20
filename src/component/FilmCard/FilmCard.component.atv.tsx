import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  FILM_TYPE_COLORS,
  TYPE_LABELS,
} from './FilmCard.config';
import { styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';

export function FilmCardComponent({
  filmCard,
  style,
  stylePoster,
  isFocused = false,
}: FilmCardComponentProps) {
  const {
    type,
    poster,
    title,
    subtitle,
    info,
    isPendingRelease,
  } = filmCard;

  const renderType = () => (
    <ThemedText
      style={ [
        styles.typeText,
        { backgroundColor: FILM_TYPE_COLORS[type] },
      ] }
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
    <ThemedImage
      style={ [
        styles.poster,
        stylePoster,
        isFocused && styles.posterFocused,
        isPendingRelease && styles.posterPendingRelease,
      ] }
      src={ poster }
    />
  );

  const renderAdditionContainer = () => (
    <View style={ styles.additionContainer }>
      { renderType() }
      { renderFilmAdditionalText() }
    </View>
  );

  const renderTitle = () => (
    <ThemedText
      style={ [styles.title, isFocused ? styles.titleFocused : styles.title] }
      numberOfLines={ 2 }
    >
      { title }
    </ThemedText>
  );

  const renderSubtitle = () => (
    <ThemedText
      style={ [
        styles.subtitle,
        isFocused ? styles.subtitleFocused : styles.subtitle,
      ] }
      numberOfLines={ 2 }
    >
      { subtitle }
    </ThemedText>
  );

  return (
    <Animated.View
      style={ [
        styles.card,
        isFocused && styles.cardFocused,
        style,
      ] }
    >
      <View
        style={ [
          styles.posterWrapper,
          isFocused && styles.posterWrapperFocused,
        ] }
      >
        { renderPoster() }
        { renderAdditionContainer() }
      </View>
      <View
        style={ [
          styles.info,
          isFocused && styles.infoFocused,
        ] }
      >
        { renderTitle() }
        { renderSubtitle() }
      </View>
    </Animated.View>
  );
}

export default FilmCardComponent;
