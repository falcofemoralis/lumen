import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Mic, Search } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, SpatialNavigationView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './SearchScreen.style.atv';
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
}: SearchScreenComponentProps) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const [currentRow, setCurrentRow] = useState(0);

  const renderSearchBar = () => (
    <View style={ styles.searchBarContainer }>
      <ThemedInput
        style={ styles.searchBar }
        placeholder={ t('Search') }
        onChangeText={ (text) => onChangeText(text) }
        onSubmitEditing={ ({ nativeEvent: { text } }) => onApplySearch(text) }
        value={ enteredText }
      />
    </View>
  );

  const renderSearchContainer = () => (
    <DefaultFocus>
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
          IconComponent={ Mic }
          onPress={ handleStartRecognition }
          iconProps={ recognizing ? { color: theme.colors.icon } : undefined }
          withAnimation
        />
        { renderSearchBar() }
        <ThemedButton
          style={ styles.actionBtn }
          IconComponent={ Search }
          onPress={ handleApplySearch }
          withAnimation
        />
      </SpatialNavigationView>
    </DefaultFocus>
  );

  const renderSuggestions = () => {
    if (!suggestions.length) {
      return null;
    }

    return (
      <View
        style={ {
          ...styles.suggestionsWrapper,
          ...(currentRow > 0 && styles.hidden),
        } }
      >
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

    if (!isLoading && !pagerItems[0].films?.length) {
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
      <FilmPager
        gridStyle={ styles.grid }
        items={ pagerItems }
        onLoadFilms={ onLoadFilms }
        onUpdateFilms={ onUpdateFilms }
        onRowFocus={ setCurrentRow }
      />
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

export default SearchScreenComponent;
