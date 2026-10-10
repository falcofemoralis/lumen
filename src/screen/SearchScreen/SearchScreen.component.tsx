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
import ArrowUpLeft from 'lucide-react-native/icons/arrow-up-left';
import LayoutGrid from 'lucide-react-native/icons/layout-grid';
import Mic from 'lucide-react-native/icons/mic';
import History from 'lucide-react-native/icons/rotate-ccw-clock';
import Search from 'lucide-react-native/icons/search';
import Settings2 from 'lucide-react-native/icons/settings-2';
import X from 'lucide-react-native/icons/x';
import { ScrollView, View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './SearchScreen.style';
import { SearchScreenComponentProps } from './SearchScreen.type';
import { SearchFilters } from './SearchScreen.filters';
import { SearchEmpty } from './SearchScreen.empty';

export function SearchScreenComponent(props: SearchScreenComponentProps) {
    const {
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
    onPreLoad,
    onNextLoad,
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
    isRemovableSuggestion,
    handleRemoveSuggestion,
    removeSuggestion,
} = props;
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
    if (!suggestions.length) {
      return null;
    }

    return (
      <ScrollView style={ { maxHeight: scale(120) } }><View style={ styles.suggestionsContainer }>
        { suggestions.map((suggestion) => (
          <ThemedPressable
            key={ suggestion }
            onPress={ () => onApplySuggestion(suggestion) }
            // Only history entries can be removed -- the service's suggestions
            // must not bring up the confirmation at all.
            onLongPress={ isRemovableSuggestion(suggestion)
              ? () => {
                Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_Start);
                handleRemoveSuggestion(suggestion);
              }
              : undefined }
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
      </View></ScrollView>
    );
  };

  const renderFilms = () => {
    if (!query) {
      return null;
    }


    return (
      <View style={ styles.grid }>
        <FilmPager
          pagerItems={ pagerItems }
          onPreLoad={ onPreLoad }
          onNextLoad={ onNextLoad }
          disableStatusbarSafeArea
          isEmpty={ !isLoading && !pagerItems[0]?.films?.length }
          ListEmptyComponent={ <SearchEmpty { ...props } /> }
        />
      </View>
    );
  };

  const renderCategories = () => <SearchFilters { ...props } />;
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
