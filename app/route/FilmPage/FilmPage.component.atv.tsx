import FilmVideoSelector from 'Component/FilmVideoSelector';
import Page from 'Component/Page';
import Player from 'Component/Player';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { DEMO_VIDEO } from 'Route/PlayerPage/PlayerPage.config';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { styles } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';
import ThemedButton from 'Component/ThemedButton';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, isSelectorVisible, filmVideo, playFilm, hideVideoSelector, handleVideoSelect } =
    props;
  //const [focusedElement, setFocusedElement] = useState<string | null>('Watch Now');

  // const handleHide = () => {
  //   setFocusedElement('Watch Now');
  //   hideVideoSelector();
  // };

  // set focus element
  // remove focused element
  // back? set focus
  const renderAction = (text: string, onPress?: () => void) => {
    return (
      <SpatialNavigationFocusableView
        //hasTVPreferredFocus={focusedElement === text}
        onSelect={onPress}
        // onFocus={() => setFocusedElement(text)}
        // onBlur={() => setFocusedElement(null)}
      >
        <ThemedButton
          label={text}
          onPress={onPress}
        />
      </SpatialNavigationFocusableView>
    );
  };

  const renderActions = () => {
    return (
      <SpatialNavigationView direction="horizontal">
        <DefaultFocus>
          <ThemedView style={{ flex: 1, flexDirection: 'row' }}>
            {renderAction('Watch Now TV', playFilm)}
            {/* {renderAction('Comments')}
            {renderAction('Bookmark')}
            {renderAction('Trailer')}
            {renderAction('Share')}
            {renderAction('Download')} */}
          </ThemedView>
        </DefaultFocus>
      </SpatialNavigationView>
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

  const renderLoadedContent = () => {
    return (
      <ThemedView>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  };

  const renderContent = () => {
    if (!film) {
      return renderLoadedContent();
    }

    return (
      <>
        <ThemedText>Loaded!</ThemedText>
        <ThemedText>title={film.title}</ThemedText>
        <ThemedText>id={film.id}</ThemedText>
        <ThemedImage
          src={film.poster}
          style={{ height: 250, width: 140 }}
        />
        {renderVideoSelector()}
      </>
    );
  };

  if (filmVideo) {
    return (
      <View style={styles.player}>
        <Player uri={DEMO_VIDEO} />
      </View>
    );
  }

  return (
    <Page>
      {renderActions()}
      {renderContent()}
    </Page>
  );
}

export default FilmPageComponent;
