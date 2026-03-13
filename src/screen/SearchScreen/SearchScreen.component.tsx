import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import * as Haptics from 'expo-haptics';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ArrowUpLeft, History, LayoutGrid, Mic, Search, Settings2, X } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
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
  additionalContentOverlayRef,
  categories,
  selectedCategory,
  selectedGenre,
  selectedYear,
  isCategoriesLoading,
  confirmationOverlayRef,
  onChangeText,
  onApplySearch,
  onApplySuggestion,
  onLoadFilms,
  onUpdateFilms,
  handleStartRecognition,
  handleApplySearch,
  resetSearch,
  clearSearch,
  openAdditionalContentOverlay,
  handleApplyAdditionalContent,
  handleOpenCollections,
  setSelectedCategory,
  setSelectedGenre,
  setSelectedYear,
  handleRemoveSuggestion,
  removeSuggestion,
}: SearchScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderSearchBar = () => (
    <View style={ styles.searchBarContainer }>
      <ThemedPressable
        style={ styles.actionBtnSearch }
        onPress={ handleApplySearch }
      >
        <Search
          style={ styles.actionBtnIcon }
          size={ scale(16) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
      <ThemedInput
        style={ styles.searchBarInput }
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
        style={ [styles.actionBtn, recognizing && styles.speakActive] }
        onPress={ handleStartRecognition }
      >
        <Mic
          style={ styles.actionBtnIcon }
          size={ scale(16) }
          color={ recognizing ? theme.colors.iconOnContrast : theme.colors.icon }
        />
      </ThemedPressable>
      { renderSearchBar() }
      <ThemedPressable
        style={ styles.actionBtn }
        onPress={ openAdditionalContentOverlay }
      >
        <Settings2
          style={ styles.actionBtnIcon }
          size={ scale(16) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
      <ThemedPressable
        style={ styles.actionBtn }
        onPress={ handleOpenCollections }
      >
        <LayoutGrid
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
            onLongPress={ () => {
              Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_Start);
              handleRemoveSuggestion(suggestion);
            } }
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
      <ScrollView>
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
          <ThemedButton
            style={ styles.categoriesSelectBtn }
            onPress={ handleApplyAdditionalContent }
          >
            { t('Lets search!') }
          </ThemedButton>
        </View>
      </ScrollView>
    );
  };

  const renderCategoriesModal = () => {
    return (
      <ThemedOverlay ref={ additionalContentOverlayRef }>
        { renderCategories() }
      </ThemedOverlay>
    );
  };

  const renderConfirmationModal = () => {
    return (
      <ConfirmOverlay
        overlayRef={ confirmationOverlayRef }
        onConfirm={ removeSuggestion }
        title={ t('Are you sure?') }
        message={ t('Do you want to remove this suggestion from history?') }
        confirmButtonText={ t('Remove') }
      />
    );
  };

  return (
    <Page>
      { renderCategoriesModal() }
      { renderConfirmationModal() }
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
