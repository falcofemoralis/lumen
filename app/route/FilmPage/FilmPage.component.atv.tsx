import FilmVideoSelector from 'Component/FilmVideoSelector';
import Page from 'Component/Page';
import Player from 'Component/Player';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { DEMO_VIDEO } from 'Route/PlayerPage/PlayerPage.config';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FILM_ROUTE } from '../../navigation/_layout';
import { styles } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, isSelectorVisible, filmVideo, playFilm, hideVideoSelector, handleVideoSelect } =
    props;
  const [focusedElement, setFocusedElement] = useState<string | null>('Watch Now');

  const handleHide = () => {
    setFocusedElement('Watch Now');
    hideVideoSelector();
  };

  // set focus element
  // remove focused element
  // back? set focus
  const renderAction = (text: string, onPress?: () => void) => {
    return (
      <TouchableOpacity
        hasTVPreferredFocus={focusedElement === text}
        onPress={onPress}
        onFocus={() => setFocusedElement(text)}
        onBlur={() => setFocusedElement(null)}
      >
        <ThemedText>{text}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderActions = () => {
    return (
      <ThemedView>
        {renderAction('Watch Now', playFilm)}
        {renderAction('Comments')}
        {renderAction('Bookmark')}
        {renderAction('Trailer')}
        {renderAction('Share')}
        {renderAction('Download')}
      </ThemedView>
    );
  };

  const renderVideoSelector = () => {
    if (!film) {
      return null;
    }

    const { voices = [] } = film;

    if (!voices.length) {
      return null;
    }

    return (
      <FilmVideoSelector
        film={film}
        visible={isSelectorVisible}
        onHide={hideVideoSelector}
        onSelect={handleVideoSelect}
      />
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
    return (
      <View style={styles.player}>
        <Player uri={DEMO_VIDEO} />
      </View>
    );
  }

  return (
    <Page name={FILM_ROUTE}>
      {renderActions()}
      <ThemedText>Loaded!</ThemedText>
      <ThemedText>title={film.title}</ThemedText>
      <ThemedText>id={film.id}</ThemedText>
      <ThemedImage
        src={film.poster}
        style={{ height: 250, width: 140 }}
      />
      {renderVideoSelector()}
    </Page>
  );
}

export default FilmPageComponent;
