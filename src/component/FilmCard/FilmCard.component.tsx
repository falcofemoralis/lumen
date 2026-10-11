import { posterSeriesInfo } from 'Util/Film/posterStatus';
import { FilmRating } from 'Component/FilmRating';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useShowPendingReleaseBadge } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import Ban from 'lucide-react-native/icons/ban';
import Timer from 'lucide-react-native/icons/timer';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { FILM_TYPE_COLORS, HIDDEN_ICON_SIZE, TYPE_LABELS } from './FilmCard.config';
import { componentStyles } from './FilmCard.style';
import { FilmCardComponentProps } from './FilmCard.type';

export function FilmCardComponent({
  filmCard,
  style,
  isHidden,
  isRatingVisible,
}: FilmCardComponentProps) {
  const {
    type,
    poster,
    title,
    subtitle,
    isPendingRelease,
  } = filmCard;
  const styles = useThemedStyles(componentStyles);
  const { theme, scale } = useAppTheme();
  const showPendingReleaseBadge = useShowPendingReleaseBadge();
  const info = posterSeriesInfo(filmCard);

  const renderType = () => (filmCard.contentTypePending ? null :
    <ThemedText
      style={ [
        styles.typeText,
        { backgroundColor: FILM_TYPE_COLORS[type] },
      ] }
    >
      { t( TYPE_LABELS[type]) }
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
      style={ [styles.poster, isPendingRelease && styles.posterPendingRelease] }
      cachePolicy='memory-disk'
      src={ poster }
    />
  );

  const renderPendingReleaseBadge = () => {
    if (!isPendingRelease || !showPendingReleaseBadge) {
      return null;
    }

    return (
      <View style={ styles.pendingReleaseBadge }>
        <Timer size={ scale(18) } color={ theme.colors.textOnContrast } />
      </View>
    );
  };
  const renderAdditionContainer = () => (
    <View style={ styles.additionContainer }>
      { renderType() }
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

  if (isHidden) {
    return (
      <View style={ [styles.card, style] }>
        <View style={ styles.posterWrapper }>
          <View style={ [styles.poster, styles.hiddenPoster] }>
            <Ban
              size={ scale(HIDDEN_ICON_SIZE) }
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
      </View>
    );
  }

  return (
    <View style={ [styles.card, style] }>
      <View style={ styles.posterWrapper }>
        { renderPoster() }
        <FilmRating
          filmId={ filmCard.id }
          ratings={ filmCard.ratings }
          ratingSourceType={ filmCard.ratingSourceType }
          ratingFilmId={ filmCard.ratingFilmId }
          isVisible={ isRatingVisible }
        />
        { renderAdditionContainer() }
        { renderPendingReleaseBadge() }
      </View>
      <View style={ styles.info }>
        { renderTitle() }
        { renderSubtitle() }
      </View>
    </View>
  );
}

export default FilmCardComponent;



