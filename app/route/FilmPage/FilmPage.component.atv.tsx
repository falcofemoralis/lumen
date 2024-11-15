import Player from 'Component/Player';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity, View } from 'react-native';
import { style } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, filmVideo, playFilm } = props;

  const renderAction = (text: string, onPress?: () => void, isDefault: boolean = false) => {
    return (
      <TouchableOpacity
        hasTVPreferredFocus={isDefault}
        onPress={onPress}
      >
        <ThemedText>{text}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderActions = () => {
    return (
      <ThemedView>
        {renderAction('Watch Now', playFilm, true)}
        {renderAction('Comments')}
        {renderAction('Bookmark')}
        {renderAction('Trailer')}
        {renderAction('Share')}
        {renderAction('Download')}
      </ThemedView>
    );
  };

  if (!film) {
    return (
      <ThemedView>
        <TouchableOpacity hasTVPreferredFocus>
          <ThemedText>Im a focused button</ThemedText>
        </TouchableOpacity>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (filmVideo) {
    const streams = filmVideo.streams;

    return (
      <View style={style.player}>
        <Player uri={streams[0].url} />
      </View>
    );
  }

  return (
    <ThemedView>
      {renderActions()}
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
