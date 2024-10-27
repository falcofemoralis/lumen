import ThemedView from 'Component/ThemedView';
import { styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';
import ThemedText from 'Component/ThemedText';

export function FilmCardComponent(props: FilmCardComponentProps) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText>{props.film}</ThemedText>
    </ThemedView>
  );
}

export default FilmCardComponent;
