import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedInput from 'Component/ThemedInput';
import ThemedView from 'Component/ThemedView';
import React, { useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, SpatialNavigationView } from 'react-tv-space-navigation';

import { SEARCH_MENU_ITEM } from './SearchPage.config';
import { styles } from './SearchPage.style.atv';
import { SearchPageComponentProps } from './SearchPage.type';

export function SearchPageComponent({
  suggestions,
  filmPager,
  query,
  recognizing,
  loadSuggestions,
  onApplySuggestion,
  onLoadFilms,
  onUpdateFilms,
  handleStartRecognition,
  handleApplySearch,
}: SearchPageComponentProps) {
  const [currentRow, setCurrentRow] = useState(0);

  const renderSearchBar = () => (
    <View style={ styles.searchBarContainer }>
      <DefaultFocus>
        <ThemedInput
          placeholder="Search"
          onChangeText={ (text) => loadSuggestions(text) }
          style={ styles.searchBar }
          onSubmitEditing={ ({ nativeEvent: { text } }) => onApplySuggestion(text) }
          value={ query }
        />
      </DefaultFocus>
    </View>
  );

  const renderSearchContainer = () => (
    <SpatialNavigationView
      style={ {
        ...styles.searchContainer,
        ...(currentRow > 0 && styles.hidden),
      } }
      direction="horizontal"
    >
      <ThemedButton
        style={ styles.actionBtn }
        styleFocused={ recognizing && styles.speakActive }
        iconStyleFocused={ recognizing && styles.speakActiveIcon }
        icon={ {
          pack: IconPackType.MaterialCommunityIcons,
          name: 'microphone-outline',
        } }
        onPress={ handleStartRecognition }
      />
      { renderSearchBar() }
      <ThemedButton
        style={ styles.actionBtn }
        icon={ {
          name: 'magnify',
          pack: IconPackType.MaterialCommunityIcons,
        } }
        onPress={ handleApplySearch }
      />
    </SpatialNavigationView>
  );

  const renderSuggestions = () => {
    if (!suggestions.length) {
      return null;
    }

    return (
      <View style={ styles.suggestionsWrapper }>
        <SpatialNavigationScrollView
          horizontal
          offsetFromStart={ 20 }
        >
          <SpatialNavigationView
            direction="horizontal"
            style={ styles.suggestions }
          >
            { suggestions.map((item) => (
              <ThemedButton
                key={ item }
                onPress={ () => onApplySuggestion(item) }
              >
                { item }
              </ThemedButton>
            )) }
          </SpatialNavigationView>
        </SpatialNavigationScrollView>
      </View>
    );
  };

  const renderFilms = () => {
    if (!query) {
      return null;
    }

    return (
      <FilmPager
        gridStyle={ styles.grid }
        menuItems={ [SEARCH_MENU_ITEM] }
        filmPager={ filmPager }
        onLoadFilms={ onLoadFilms }
        onUpdateFilms={ onUpdateFilms }
        onRowFocus={ setCurrentRow }
      />
    );
  };

  return (
    <Page>
      <ThemedView style={ styles.container }>
        { renderSearchContainer() }
        { renderSuggestions() }
      </ThemedView>
      { renderFilms() }
    </Page>
  );
}

export default SearchPageComponent;
