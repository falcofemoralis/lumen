import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';

import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent({
  film,
  isSelectorVisible,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
}: FilmPageComponentProps) {
  const renderAction = (text: string, onPress?: () => void) => (
    <SpatialNavigationFocusableView>
      <ThemedButton onPress={ onPress }>{ text }</ThemedButton>
    </SpatialNavigationFocusableView>
  );

  const renderActions = () => (
    <SpatialNavigationView direction="horizontal">
      <DefaultFocus>
        <ThemedView style={ { flex: 1, flexDirection: 'row', gap: scale(10) } }>
          { renderAction('Watch Now TV', playFilm) }
          { renderAction('Comments') }
          { renderAction('Bookmark') }
          { renderAction('Trailer') }
          { renderAction('Share') }
          { renderAction('Download') }
        </ThemedView>
      </DefaultFocus>
    </SpatialNavigationView>
  );

  const renderPlayerVideoSelector = () => {
    if (!film) {
      return null;
    }

    const { voices = [] } = film;

    if (!voices.length) {
      return null;
    }

    return (
      <PlayerVideoSelector
        film={ film }
        visible={ isSelectorVisible }
        onHide={ hideVideoSelector }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderLoadedContent = () => (
    <ThemedView>
      <ThemedText>Loading...</ThemedText>
    </ThemedView>
  );

  const renderContent = () => {
    if (!film) {
      return renderLoadedContent();
    }

    return (
      <View>
        <ThemedText>Loaded!</ThemedText>
        <ThemedText>
          title=
          { film.title }
        </ThemedText>
        <ThemedText>
          id=
          { film.id }
        </ThemedText>
        <ThemedImage
          src={ film.poster }
          style={ { height: 250, width: 140 } }
        />
      </View>
    );
  };

  const renderModals = () => renderPlayerVideoSelector();

  return (
    <Page>
      { renderActions() }
      { renderContent() }
      { renderModals() }
    </Page>
  );
}

export default FilmPageComponent;