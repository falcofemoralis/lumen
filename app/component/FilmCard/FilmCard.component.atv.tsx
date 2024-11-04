import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { styles } from './FilmCard.style.atv';
import { FilmCardComponentProps } from './FilmCard.type';
import { Image } from 'react-native';

export function FilmCardComponent(props: FilmCardComponentProps) {
  const { filmCard } = props;

  return (
    <ThemedView style={styles.card}>
      <Image
        style={styles.poster}
        source={{
          uri: filmCard.poster,
        }}
        onError={(e) => console.log(e.nativeEvent.error)}
      />
      <ThemedText style={styles.title}>{filmCard.title}</ThemedText>
    </ThemedView>
  );
}

export default FilmCardComponent;
