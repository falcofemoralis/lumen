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
      <ThemedText>Loaded!</ThemedText>
      <ThemedText>title={film.title}</ThemedText>
      <ThemedText>id={film.id}</ThemedText>
      <ThemedImage
        src={film.poster}
        style={{ height: 250, width: 140 }}
      />
    </ThemedView>
  );
}

export default FilmPageComponent;
