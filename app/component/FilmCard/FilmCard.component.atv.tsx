import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { FocusedAnimation, styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';

export function FilmCardComponent(props: FilmCardComponentProps) {
  const { filmCard, style, isFocused, isThumbnail } = props;
  const { poster, title, subtitle } = filmCard;

  if (isThumbnail) {
    return <ThemedView style={[styles.card, styles.cardThumbnail, style]} />;
  }

  return (
    <FocusedAnimation isFocused={isFocused}>
      {({
        animatedScaleStyle,
        animatedInfoStyle,
        animatedTitleStyle,
        animatedSubtitleStyle,
        animatedPosterStyle,
      }) => (
        <ThemedView.Animated style={[styles.card, animatedScaleStyle, style]}>
          <ThemedView.Animated style={[styles.posterWrapper, animatedPosterStyle]}>
            <ThemedImage
              style={styles.poster}
              src={poster}
            />
          </ThemedView.Animated>
          <ThemedView.Animated style={[styles.info, animatedInfoStyle]}>
            <ThemedText.Animated
              style={[styles.title, animatedTitleStyle, style]}
              numberOfLines={2}
            >
              {title}
            </ThemedText.Animated>
            <ThemedText.Animated
              style={[styles.subtitle, animatedSubtitleStyle]}
              numberOfLines={2}
            >
              {subtitle}
            </ThemedText.Animated>
          </ThemedView.Animated>
        </ThemedView.Animated>
      )}
    </FocusedAnimation>
  );
}

export default FilmCardComponent;
