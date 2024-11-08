import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';

export function FilmCardComponent(props: FilmCardComponentProps) {
  const { filmCard } = props;

  return (
    <ThemedView style={styles.card}>
      <ThemedImage
        src={filmCard.poster}
        style={styles.poster}
      />
      <ThemedText style={styles.title}>{filmCard.title}</ThemedText>
    </ThemedView>
  );
}

export default FilmCardComponent;
