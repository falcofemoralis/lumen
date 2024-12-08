import FilmVideoSelector from 'Component/FilmVideoSelector';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { scale } from 'Util/CreateStyles';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, isSelectorVisible, playFilm, hideVideoSelector, handleVideoSelect } = props;

  const renderAction = (text: string, onPress?: () => void) => {
    return (
      <SpatialNavigationFocusableView>
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
          <ThemedView style={{ flex: 1, flexDirection: 'row', gap: scale(10) }}>
            {renderAction('Watch Now TV', playFilm)}
            {renderAction('Comments')}
            {renderAction('Bookmark')}
            {renderAction('Trailer')}
            {renderAction('Share')}
            {renderAction('Download')}
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
      <View>
        <ThemedText>Loaded!</ThemedText>
        <ThemedText>title={film.title}</ThemedText>
        <ThemedText>id={film.id}</ThemedText>
        <ThemedImage
          src={film.poster}
          style={{ height: 250, width: 140 }}
        />
      </View>
    );
  };

  const renderModals = () => {
    return renderVideoSelector();
  };

  return (
    <Page testId="filmPage">
      {renderActions()}
      {renderContent()}
      {renderModals()}
    </Page>
  );
}

export default FilmPageComponent;
