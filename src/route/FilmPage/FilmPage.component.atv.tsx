// @ts-nocheck
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedCard from 'Component/ThemedCard';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import Thumbnail from 'Component/Thumbnail';
import __ from 'i18n/__';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';

import { styles } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent({
  film,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
}: FilmPageComponentProps) {
  const renderAction = (text: string, onPress?: () => void) => (
    <SpatialNavigationFocusableView>
      <ThemedButton
        variant="outlined"
        onPress={ onPress }
      >
        { text }
      </ThemedButton>
    </SpatialNavigationFocusableView>
  );

  const renderActions = () => (
    <SpatialNavigationView direction="horizontal">
      <DefaultFocus>
        <ThemedView style={ styles.actions }>
          { renderAction(__('Watch Now'), playFilm) }
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
    const { voices = [] } = film;

    if (!voices.length) {
      return null;
    }

    return (
      <PlayerVideoSelector
        film={ film }
        onHide={ hideVideoSelector }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderMainContent = () => (
    <View style={ styles.mainContent }>
      { renderPoster() }
      { renderMainInfo() }
    </View>
  );

  const renderPoster = () => {
    const { poster } = film;

    return (
      <ThemedImage
        src={ poster }
        style={ styles.poster }
      />
    );
  };

  const renderMainInfo = () => {
    const {
      title,
      originalTitle,
      releaseDate,
      genres = [],
      countries = [],
      duration,
    } = film;

    return (
      <ThemedCard style={ styles.mainInfo }>
        <ThemedText style={ styles.title }>{ title }</ThemedText>
        { originalTitle && (
          <ThemedText style={ styles.originalTitle }>
            { originalTitle }
          </ThemedText>
        ) }
      </ThemedCard>
    );
  };

  const renderModals = () => renderPlayerVideoSelector();

  const renderPage = () => (
    <View>
      { renderActions() }
      { renderMainContent() }
      { renderModals() }
    </View>
  );

  const renderPreview = () => (
    <View>
      <SpatialNavigationView direction="horizontal">
        <ThemedView style={ styles.actions }>
          { Array(5).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-thumb` }
              height={ 32 }
              width={ 110 }
            />
          )) }
        </ThemedView>
      </SpatialNavigationView>
      <View style={ styles.mainContent }>
        <Thumbnail style={ styles.poster } />
        <Thumbnail style={ styles.mainInfo } />
      </View>
    </View>
  );

  const renderContent = () => {
    if (!film) {
      return renderPreview();
    }

    return renderPage();
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
}

export default FilmPageComponent;
