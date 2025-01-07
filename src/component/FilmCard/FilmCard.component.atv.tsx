import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import Thumbnail from 'Component/Thumbnail';
import { Animated, View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { FILM_TYPE_COLORS, TYPE_LABELS } from './FilmCard.config';
import {
  CARD_HEIGHT_TV, INFO_HEIGHT, INFO_PADDING_TOP, POSTER_HEIGHT, styles,
} from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';
import { useFocusAnimation } from './useFocusAnimation';

export function FilmCardComponent({
  filmCard,
  style,
  isFocused = false,
  isThumbnail,
}: FilmCardComponentProps) {
  const {
    type,
    poster,
    title,
    subtitle,
    info,
  } = filmCard;

  const scaleAnimation = useFocusAnimation(isFocused);

  if (isThumbnail) {
    return (
      <View style={ { gap: scale(INFO_PADDING_TOP * 2) } }>
        <Thumbnail
          style={ [
            styles.card,
            { height: POSTER_HEIGHT },
            style,
          ] }
        />
        <Thumbnail
          height={ INFO_HEIGHT / 4 }
          width="100%"
        />
        <Thumbnail
          height={ INFO_HEIGHT / 6 }
          width="50%"
        />
      </View>
    );
  }

  const renderType = () => (
    <View style={ styles.additionItemContainer }>
      <ThemedText
        style={ [styles.typeText, { backgroundColor: FILM_TYPE_COLORS[type] }] }
      >
        { TYPE_LABELS[type] }
      </ThemedText>
    </View>
  );

  const renderFilmAdditionalText = () => {
    if (!info) {
      return null;
    }

    return (
      <View style={ styles.additionItemContainer }>
        <ThemedText
          style={ [
            styles.filmAdditionalText,
            { backgroundColor: FILM_TYPE_COLORS[type] },
            isFocused && styles.posterFocused,
          ] }
        >
          { info }
        </ThemedText>
      </View>
    );
  };

  const renderAdditionContainer = () => (
    <View
      style={ [
        {
          height: CARD_HEIGHT_TV - INFO_HEIGHT,
          marginTop: (CARD_HEIGHT_TV - INFO_HEIGHT) * -1,
        },
        styles.additionContainer,
      ] }
    >
      { renderType() }
      { renderFilmAdditionalText() }
    </View>
  );

  const renderPoster = () => (
    <ThemedImage
      style={ [
        { height: CARD_HEIGHT_TV - INFO_HEIGHT },
        styles.poster,
        isFocused && styles.posterFocused,
      ] }
      src={ poster }
    />
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
      style={ [styles.card, { height: CARD_HEIGHT_TV }, scaleAnimation, style] }
    >
      { renderPoster() }
      { renderAdditionContainer() }
      <ThemedView
        style={ [
          styles.info,
          { height: INFO_HEIGHT },
          isFocused ? styles.infoFocused : styles.info,
        ] }
      >
        { renderTitle() }
        { renderSubtitle() }
      </ThemedView>
    </Animated.View>
  );
}

export default FilmCardComponent;
