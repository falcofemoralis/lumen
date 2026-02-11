import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ArrowUpLeft, History, Mic, Search, X } from 'lucide-react-native';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './SearchScreen.style';
import { SearchScreenComponentProps } from './SearchScreen.type';

export function SearchScreenComponent({
  suggestions,
  pagerItems,
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
}: SearchScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderSearchBar = () => (
    <View style={ styles.searchBarContainer }>
      <ThemedInput
        containerStyle={ styles.searchBar }
        placeholder={ t('Search') }
        onChangeText={ (text) => onChangeText(text) }
        onSubmitEditing={ ({ nativeEvent: { text } }) => onApplySearch(text) }
        value={ enteredText }
        placeholderTextColor={ theme.colors.text }
        selectionColor={ theme.colors.primary }
        cursorColor={ theme.colors.text }
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
            color={ theme.colors.icon }
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
          color={ theme.colors.icon }
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
          color={ theme.colors.icon }
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
            contentStyle={ styles.suggestionContent }
          >
            <History
              style={ styles.suggestionIcon }
              size={ scale(20) }
              color={ theme.colors.icon }
            />
            <ThemedText style={ styles.suggestionText }>
              { suggestion }
            </ThemedText>
            <ArrowUpLeft
              style={ styles.suggestionIcon }
              size={ scale(20) }
              color={ theme.colors.icon }
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

    if (!isLoading && !pagerItems[0]?.films?.length) {
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
          items={ pagerItems }
          onLoadFilms={ onLoadFilms }
          onUpdateFilms={ onUpdateFilms }
          isAddSafeArea={ false }
        />
      </View>
    );
  };

  return (
    <Page>
      <ThemedSafeArea>
        <View style={ styles.content }>
          <View style={ styles.container }>
            <Wrapper>
              { renderSearchContainer() }
            </Wrapper>
            { renderSuggestions() }
          </View>
          { renderFilms() }
        </View>
      </ThemedSafeArea>
    </Page>
  );
}

export default SearchScreenComponent;
