import FilmPager from 'Component/FilmPager';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedInput from 'Component/ThemedInput';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import React from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
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
        <ThemedButton
          style={ styles.closeBtn }
          iconStyle={ [styles.closeIcon] }
          icon={ {
            pack: IconPackType.MaterialCommunityIcons,
            name: 'close',
          } }
          iconSize={ scale(20) }
          onPress={ clearSearch }
        />
      ) }
    </View>
  );

  const renderSearchContainer = () => (
    <View style={ styles.searchContainer }>
      <ThemedButton
        style={ styles.actionBtn }
        iconStyle={ styles.actionBtnIcon }
        icon={ {
          name: 'magnify',
          pack: IconPackType.MaterialCommunityIcons,
        } }
        iconSize={ scale(18) }
        onPress={ handleApplySearch }
      />
      { renderSearchBar() }
      <ThemedButton
        style={ [styles.actionBtn, recognizing && styles.speakActive] }
        iconStyle={ [styles.actionBtnIcon, recognizing && styles.speakActiveIcon] }
        icon={ {
          pack: IconPackType.MaterialCommunityIcons,
          name: 'microphone-outline',
        } }
        iconSize={ scale(18) }
        onPress={ handleStartRecognition }
      />
    </View>
  );

  const renderSuggestions = () => {
    if (!suggestions.length || query) {
      return null;
    }

    return (
      <View style={ styles.suggestionsContainer }>
        { suggestions.map((suggestion) => (
          <TouchableNativeFeedback
            key={ suggestion }
            onPress={ () => onApplySuggestion(suggestion) }
            background={ TouchableNativeFeedback.Ripple(
              Colors.white,
              true,
            ) }
          >
            <View style={ styles.suggestion }>
              <ThemedIcon
                style={ styles.suggestionIcon }
                icon={ {
                  pack: IconPackType.MaterialCommunityIcons,
                  name: 'history',
                } }
                size={ scale(20) }
                color="white"
              />
              <ThemedText style={ styles.suggestionText }>
                { suggestion }
              </ThemedText>
              <ThemedIcon
                style={ styles.suggestionIcon }
                icon={ {
                  pack: IconPackType.MaterialCommunityIcons,
                  name: 'arrow-top-left',
                } }
                size={ scale(20) }
                color="white"
              />
            </View>
          </TouchableNativeFeedback>
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
