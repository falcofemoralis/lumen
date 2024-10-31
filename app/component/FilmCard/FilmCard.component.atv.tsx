import ThemedView from 'Component/ThemedView';
import { styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';
import ThemedText from 'Component/ThemedText';

export function FilmCardComponent(props: FilmCardComponentProps) {
  const { film } = props;

  return (
    <ThemedView style={styles.card}>
      <ThemedText>{film.info}</ThemedText>
    </ThemedView>
  );
}

export default FilmCardComponent;
