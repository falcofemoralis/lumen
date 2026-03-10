import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { LayoutGrid, Mic, Search, Settings2 } from 'lucide-react-native';
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
  openAdditionalContentOverlay,
  handleOpenCollections,
}: SearchScreenComponentProps & {
  styles: ThemedStyles<typeof componentStyles>;
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
          iconProps={ recognizing ? { color: theme.colors.iconOnContrast } : undefined }
          withAnimation
        />
        <ThemedButton
          style={ styles.actionBtn }
          IconComponent={ Settings2 }
          onPress={ openAdditionalContentOverlay }
          withAnimation
        />
        { renderSearchBar() }
        <ThemedButton
          style={ styles.actionBtn }
          IconComponent={ Search }
          onPress={ handleApplySearch }
          withAnimation
        />
        <ThemedButton
          style={ styles.actionBtn }
          IconComponent={ LayoutGrid }
          onPress={ handleOpenCollections }
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
    additionalContentOverlayRef,
    categories,
    selectedCategory,
    selectedGenre,
    selectedYear,
    isCategoriesLoading,
    onLoadFilms,
    onUpdateFilms,
    handleApplyAdditionalContent,
    setSelectedCategory,
    setSelectedGenre,
    setSelectedYear,
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

  const renderCategories = () => {
    if (isCategoriesLoading) {
      return (
        <View style={ styles.categoriesLoader }>
          <Loader fullScreen isLoading />
        </View>
      );
    }

    if (!categories?.length) {
      return null;
    }

    return (
      <SpatialNavigationView direction='vertical'>
        <View style={ styles.categories }>
          <ThemedText>
            { t('Choose format') }
          </ThemedText>
          <ThemedDropdown
            header={ t('Format') }
            value={ selectedCategory?.name || '' }
            data={ categories?.map((cat) => ({
              label: cat.name,
              value: cat.name,
            })) || [] }
            onChange={ (item) => {
              const cat = categories?.find((c) => c.name === item.value);

              if (cat) {
                setSelectedCategory(cat);
              }
            } }
            closeOnChange
          />
          <ThemedText>
            { t('Choose genre') }
          </ThemedText>
          <ThemedDropdown
            header={ t('Genre') }
            value={ selectedGenre || '' }
            data={ selectedCategory?.genres.map((genre) => ({
              label: genre.name,
              value: genre.value,
            })) || [] }
            onChange={ (item) => setSelectedGenre(item.value) }
            closeOnChange
          />
          <ThemedText>
            { t('Choose year') }
          </ThemedText>
          <ThemedDropdown
            header={ t('Year') }
            value={ selectedYear || '' }
            data={ selectedCategory?.years.map((year) => ({
              label: year.name,
              value: year.value,
            })) || [] }
            onChange={ (item) => setSelectedYear(item.value) }
            closeOnChange
          />
          <DefaultFocus>
            <ThemedButton
              style={ styles.categoriesSelectBtn }
              onPress={ handleApplyAdditionalContent }
            >
              { t('Lets search!') }
            </ThemedButton>
          </DefaultFocus>
        </View>
      </SpatialNavigationView>
    );
  };

  const renderCategoriesModal = () => {
    return (
      <ThemedOverlay
        ref={ additionalContentOverlayRef }
        containerStyle={ styles.categoriesOverlay }
      >
        { renderCategories() }
      </ThemedOverlay>
    );
  };

  return (
    <Page>
      { renderCategoriesModal() }
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
