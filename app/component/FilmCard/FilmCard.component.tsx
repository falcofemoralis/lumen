import ThemedText from 'Component/ThemedText';
import { FilmCardComponentProps } from './FilmCard.type';
import { styles } from './FilmCard.style';
import ThemedView from 'Component/ThemedView';
import ThemedImage from 'Component/ThemedImage';

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
