import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { FilmPageComponentProps } from './FilmPage.type';
import ThemedImage from 'Component/ThemedImage';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film } = props;

  if (!film) {
    return (
      <ThemedView>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <ThemedView>
        <ThemedImage src={film.poster} />
      </ThemedView>
      <ThemedView style={{ flex: 1, flexDirection: 'column' }}>
        <ThemedText>{film.title}</ThemedText>
        <ThemedText>{film.id}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

export default FilmPageComponent;
