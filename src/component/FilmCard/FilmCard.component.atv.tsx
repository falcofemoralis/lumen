import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Ban from 'lucide-react-native/icons/ban';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';

import { FILM_TYPE_COLORS, HIDDEN_ICON_SIZE_TV, TYPE_LABELS } from './FilmCard.config';
import { componentStyles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';

export function FilmCardComponent({
  filmCard,
  style,
  isFocused = false,
  disableScaleAnimation,
  disableScaleTransition,
  isHidden,
}: FilmCardComponentProps) {
  const {
    type,
    poster,
    title,
    subtitle,
    info,
    isPendingRelease,
  } = filmCard;
  const styles = useThemedStyles(componentStyles);
  const { theme, scale } = useAppTheme();

  const renderType = () => (
    <ThemedText
      style={ [
        styles.typeText,
        { backgroundColor: FILM_TYPE_COLORS[type] },
      ] }
    >
      { t(TYPE_LABELS[type]) }
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
        isPendingRelease && styles.posterPendingRelease,
      ] }
      src={ poster }
      // Grid cells are recycled constantly while browsing, and the same posters
      // come back the moment focus turns around. Keeping the decoded bitmaps in
      // memory spares a disk read and a decode per card -- the bulk of what it
      // costs to draw a row on a slow device.
      cachePolicy="memory-disk"
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

  const cardStyle = [
    styles.card,
    disableScaleTransition && styles.cardWithoutTransition,
    isFocused && !disableScaleAnimation && styles.cardFocused,
    style,
  ];

  if (isHidden) {
    return (
      <Animated.View style={ cardStyle }>
        { /* `posterWrapperFocused` is left off: it squares the bottom corners to
           meet the info bar, which a hidden card does not draw. */ }
        <View style={ styles.posterWrapper }>
          <View
            style={ [
              styles.poster,
              styles.hiddenPoster,
              isFocused && styles.hiddenPosterFocused,
            ] }
          >
            <Ban
              size={ scale(HIDDEN_ICON_SIZE_TV) }
              color={ theme.colors.textSecondary }
            />
            <ThemedText
              style={ styles.hiddenText }
              numberOfLines={ 3 }
            >
              { t('Hidden based on your preferences') }
            </ThemedText>
          </View>
        </View>
        <View style={ [styles.info, styles.hiddenInfo] } />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={ cardStyle }>
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
