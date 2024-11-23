import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { FilmPageComponentProps } from './FilmPage.type';
import ThemedImage from 'Component/ThemedImage';
import { ActivityIndicator, Pressable } from 'react-native';
import { Button } from 'react-native-paper';
import Colors from 'Style/Colors';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film } = props;

  if (!film) {
    console.log('No film');

    return (
      <ThemedView>
        <ActivityIndicator
          animating={true}
          color={Colors.primary}
        />
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <ThemedText>Page</ThemedText>
      <ThemedView>
        <ThemedImage
          src={film.poster}
          style={{ height: 100, width: '100%' }}
        />
      </ThemedView>
      <ThemedView>
        <ThemedText>{film.title}</ThemedText>
        <ThemedText>{film.id}</ThemedText>
        <Pressable>
          <ThemedText>Open film</ThemedText>
        </Pressable>
        <Button>Open film</Button>
      </ThemedView>
    </ThemedView>
  );
}

export default FilmPageComponent;
