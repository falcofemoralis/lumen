import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Mic, Search } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, SpatialNavigationView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './SearchScreen.style.atv';
import { SearchScreenComponentProps } from './SearchScreen.type';

const SearchHeader = memo(({
  suggestions,
  recognizing,
  enteredText,
  styles,
  onChangeText,
  onApplySearch,
  onApplySuggestion,
  handleStartRecognition,
  handleApplySearch,
}: SearchScreenComponentProps & {
  styles: ThemedStyles
}) => {
  const { theme } = useAppTheme();

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
        style={ styles.searchContainer }
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
        style={ styles.suggestionsWrapper }
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

  return (
    <View style={ styles.container }>
      { renderSearchContainer() }
      { renderSuggestions() }
    </View>
  );
});

export function SearchScreenComponent(props: SearchScreenComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const {
    pagerItems,
    query,
    isLoading,
    onLoadFilms,
    onUpdateFilms,
  } = props;

  const renderEmptyBlock = () => (
    <View style={ styles.noResults }>
      <InfoBlock
        title={ t('No results found') }
        subtitle={ t('Try searching for something else') }
      />
    </View>
  );

  const renderSearchHeader = () => (
    <SearchHeader
      { ...props }
      styles={ styles }
    />
  );

  return (
    <Page>
      <FilmPager
        items={ pagerItems }
        onLoadFilms={ onLoadFilms }
        onUpdateFilms={ onUpdateFilms }
        isGridVisible={ !!query }
        isEmpty={ !isLoading && !pagerItems[0].films?.length }
        ListHeaderComponent={ renderSearchHeader() }
        ListEmptyComponent={ renderEmptyBlock() }
      />
    </Page>
  );
}

export default SearchScreenComponent;
