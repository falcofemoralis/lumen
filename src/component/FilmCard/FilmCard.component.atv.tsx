import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { Animated, View } from 'react-native';

import {
  FILM_TYPE_COLORS,
  TYPE_LABELS,
} from './FilmCard.config';
import { styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';
import { useFocusAnimation } from './useFocusAnimation';

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
  } = filmCard;

  const scaleAnimation = useFocusAnimation(isFocused);

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

  const renderAdditionContainer = () => (
    <>
      { renderType() }
      { renderFilmAdditionalText() }
    </>
  );

  const renderPoster = () => (
    <View
      style={ styles.posterWrapper }
      renderToHardwareTextureAndroid
    >
      <ThemedImage
        style={ [
          styles.poster,
          stylePoster,
          isFocused && styles.posterFocused,
        ] }
        src={ poster }
      />
      { renderAdditionContainer() }
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
        scaleAnimation,
        style,
      ] }
    >
      { renderPoster() }
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
