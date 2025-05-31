import FilmPager from 'Component/FilmPager';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedInput from 'Component/ThemedInput';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { ArrowUpLeft, History,Mic, Search, X } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { SEARCH_MENU_ITEM } from './SearchPage.config';
import { styles } from './SearchPage.style';
import { SearchPageComponentProps } from './SearchPage.type';

export function SearchPageComponent({
  suggestions,
  filmPager,
  query,
  recognizing,
  enteredText,
  isLoading,
  onChangeText,
  onApplySearch,
  onApplySuggestion,
  onLoadFilms,
  onUpdateFilms,
  handleStartRecognition,
  handleApplySearch,
  resetSearch,
  clearSearch,
}: SearchPageComponentProps) {
  const renderSearchBar = () => (
    <View style={ styles.searchBarContainer }>
      <ThemedInput
        style={ styles.searchBar }
        placeholder={ t('Search') }
        onChangeText={ (text) => onChangeText(text) }
        onSubmitEditing={ ({ nativeEvent: { text } }) => onApplySearch(text) }
        value={ enteredText }
        placeholderTextColor={ Colors.white }
        selectionColor={ Colors.primary }
        cursorColor={ Colors.white }
        onPress={ resetSearch }
      />
      { enteredText && (
        <ThemedPressable
          style={ styles.closeBtn }
          onPress={ clearSearch }
        >
          <X
            style={ styles.closeIcon }
            size={ scale(16) }
            color={ Colors.white }
          />
        </ThemedPressable>
      ) }
    </View>
  );

  const renderSearchContainer = () => (
    <View style={ styles.searchContainer }>
      <ThemedPressable
        style={ styles.actionBtn }
        onPress={ handleApplySearch }
      >
        <Search
          style={ styles.actionBtnIcon }
          size={ scale(16) }
          color={ Colors.white }
        />
      </ThemedPressable>
      { renderSearchBar() }
      <ThemedPressable
        style={ [styles.actionBtn, recognizing && styles.speakActive] }
        onPress={ handleStartRecognition }
      >
        <Mic
          style={ styles.actionBtnIcon }
          size={ scale(16) }
          color={ Colors.white }
        />
      </ThemedPressable>
    </View>
  );

  const renderSuggestions = () => {
    if (!suggestions.length || query) {
      return null;
    }

    return (
      <View style={ styles.suggestionsContainer }>
        { suggestions.map((suggestion) => (
          <ThemedPressable
            key={ suggestion }
            onPress={ () => onApplySuggestion(suggestion) }
            style={ styles.suggestion }
          >
            <History
              style={ styles.suggestionIcon }
              size={ scale(20) }
              color={ Colors.white }
            />
            <ThemedText style={ styles.suggestionText }>
              { suggestion }
            </ThemedText>
            <ArrowUpLeft
              style={ styles.suggestionIcon }
              size={ scale(20) }
              color={ Colors.white }
            />
          </ThemedPressable>
        )) }
      </View>
    );
  };

  const renderFilms = () => {
    if (!query) {
      return null;
    }

    if (!isLoading && !filmPager.search?.filmList.films.length) {
      return (
        <View style={ styles.noResults }>
          <InfoBlock
            title={ t('No results found') }
            subtitle={ t('Try searching for something else') }
          />
        </View>
      );
    }

    return (
      <View style={ styles.grid }>
        <FilmPager
          menuItems={ [SEARCH_MENU_ITEM] }
          filmPager={ filmPager }
          onLoadFilms={ onLoadFilms }
          onUpdateFilms={ onUpdateFilms }
        />
      </View>
    );
  };

  return (
    <Page>
      <View style={ styles.container }>
        { renderSearchContainer() }
        { renderSuggestions() }
      </View>
      { renderFilms() }
    </Page>
  );
}

export default SearchPageComponent;
