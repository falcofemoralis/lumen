import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import LayoutGrid from 'lucide-react-native/icons/layout-grid';
import Mic from 'lucide-react-native/icons/mic';
import Search from 'lucide-react-native/icons/search';
import Settings2 from 'lucide-react-native/icons/settings-2';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './SearchScreen.style.atv';
import { SearchScreenComponentProps } from './SearchScreen.type';

// Derived from the text rather than the index, so the key of every suggestion
// that survives a removal stays the same across the re-render.
const suggestionFocusKey = (suggestion: string) => `SEARCH_SUGGESTION_${suggestion}`;

// First button of the search container -- where focus lands when the suggestion
// list has nothing left to fall back to.
const SEARCH_ACTIONS_FOCUS_KEY = 'SEARCH_ACTION_SPEAK';

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
  isRemovableSuggestion,
  handleRemoveSuggestion,
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
    <View style={ styles.searchContainer }>
      <ThemedButton
        title=""
        autofocus
        focusKey={ SEARCH_ACTIONS_FOCUS_KEY }
        style={ styles.actionBtn }
        contentStyle={ styles.actionBtnContent }
        styleFocused={ recognizing && styles.speakActive }
        IconComponent={ Mic }
        onPress={ handleStartRecognition }
        iconProps={ recognizing ? { color: theme.colors.iconOnContrast } : undefined }
      />
      <ThemedButton
        title=""
        style={ styles.actionBtn }
        contentStyle={ styles.actionBtnContent }
        IconComponent={ Settings2 }
        onPress={ openAdditionalContentOverlay }
      />
      { renderSearchBar() }
      <ThemedButton
        title=""
        style={ styles.actionBtn }
        contentStyle={ styles.actionBtnContent }
        IconComponent={ Search }
        onPress={ handleApplySearch }
      />
      <ThemedButton
        title=""
        style={ styles.actionBtn }
        contentStyle={ styles.actionBtnContent }
        IconComponent={ LayoutGrid }
        onPress={ handleOpenCollections }
      />
    </View>
  );

  const renderSuggestions = () => {
    if (!suggestions.length) {
      return null;
    }

    return (
      <View
        style={ styles.suggestionsWrapper }
      >
        <ThemedScrollView horizontal style={ styles.suggestions }>
          { suggestions.map((item) => (
            <ThemedButton
              key={ item }
              focusKey={ suggestionFocusKey(item) }
              title={ item }
              onPress={ () => onApplySuggestion(item) }
              // Only history entries can be removed -- the service's suggestions
              // must not bring up the confirmation at all.
              onLongPress={ isRemovableSuggestion(item)
                ? () => handleRemoveSuggestion(item)
                : undefined }
              style={ styles.suggestion }
            />
          )) }
        </ThemedScrollView>
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
    suggestions,
    isLoading,
    additionalContentOverlayRef,
    categories,
    selectedCategory,
    selectedGenre,
    selectedYear,
    isCategoriesLoading,
    confirmationOverlayRef,
    onPreLoad,
    onNextLoad,
    handleApplyAdditionalContent,
    setSelectedCategory,
    setSelectedGenre,
    setSelectedYear,
    handleRemoveSuggestion,
    removeSuggestion,
  } = props;

  // The suggestion whose removal the open confirmation is about, so the focus
  // handover below knows which button is about to disappear.
  const suggestionToRemove = useRef<string | null>(null);

  const handleOpenRemoveConfirmation = useCallback((suggestion: string) => {
    suggestionToRemove.current = suggestion;
    handleRemoveSuggestion(suggestion);
  }, [handleRemoveSuggestion]);

  // The overlay hands focus back to the button that opened it, which is exactly
  // the one the removal unmounts -- nothing would be focused once it closes.
  // Point it at the suggestion that takes the removed one's place instead (the
  // new last one, if it was the tail), or back up to the search actions once the
  // list is empty.
  const handleConfirmRemoveSuggestion = useCallback(() => {
    const removed = suggestionToRemove.current;
    suggestionToRemove.current = null;

    if (removed) {
      const removedIndex = Math.max(suggestions.indexOf(removed), 0);
      const remaining = suggestions.filter((suggestion) => suggestion !== removed);
      const nextFocused = remaining[Math.min(removedIndex, remaining.length - 1)];

      confirmationOverlayRef.current?.setFallbackRestoreFocusKey(
        nextFocused ? suggestionFocusKey(nextFocused) : SEARCH_ACTIONS_FOCUS_KEY
      );
    }

    removeSuggestion();
  }, [suggestions, confirmationOverlayRef, removeSuggestion]);

  // The header is a sibling above the grid, collapsed out of the way once focus
  // leaves the first row -- same treatment as the pager menu.
  const [headerVisible, setHeaderVisible] = useState(true);
  // Without a query there is no grid to scroll, so the header always stays up.
  const headerExpanded = headerVisible || !query;
  // Computed rather than measured: measuring from inside the collapsing wrapper
  // reads back the collapsed height and feeds itself.
  const headerHeight = styles.actionBtn.height + styles.container.marginBottom
    + (suggestions.length ? styles.suggestionsWrapper.marginTop + styles.suggestionsWrapper.height : 0);
  const headerCollapse = useSharedValue(1);
  // Kept in a shared value so the style below only ever reads shared values: a
  // plain closure value would be baked in when Reanimated first attaches the
  // style and never refreshed on the UI thread.
  const headerHeightAnim = useSharedValue(headerHeight);

  useEffect(() => {
    headerHeightAnim.value = headerHeight;
  }, [headerHeight, headerHeightAnim]);

  useEffect(() => {
    headerCollapse.value = withTiming(headerExpanded ? 1 : 0, { duration: 200 });
  }, [headerExpanded, headerCollapse]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: headerHeightAnim.value * headerCollapse.value,
    opacity: headerCollapse.value,
  }));

  const handleAtTopChange = useCallback((atTop: boolean) => {
    setHeaderVisible(atTop);
  }, []);

  const renderEmptyBlock = () => (
    <View style={ styles.noResults }>
      <InfoBlock
        title={ t('No results found') }
        subtitle={ t('Try searching for something else') }
      />
    </View>
  );

  const renderSearchHeader = () => (
    <Animated.View style={ [styles.headerCollapse, headerAnimatedStyle] }>
      <SearchHeader
        { ...props }
        handleRemoveSuggestion={ handleOpenRemoveConfirmation }
        styles={ styles }
      />
    </Animated.View>
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
      <View>
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
            title={ t('Lets search!') }
            autofocus
            style={ styles.categoriesSelectBtn }
            onPress={ handleApplyAdditionalContent }
          />
        </View>
      </View>
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

  const renderConfirmationModal = () => {
    return (
      <ConfirmOverlay
        overlayRef={ confirmationOverlayRef }
        onConfirm={ handleConfirmRemoveSuggestion }
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
      { renderSearchHeader() }
      <FilmPager
        pagerItems={ pagerItems }
        onPreLoad={ onPreLoad }
        onNextLoad={ onNextLoad }
        hideGrid={ !query }
        isEmpty={ !isLoading && !pagerItems[0].films?.length }
        ListEmptyComponent={ renderEmptyBlock() }
        onAtTopChange={ handleAtTopChange }
      />
    </Page>
  );
}

export default SearchScreenComponent;
