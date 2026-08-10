import { useNavigation } from '@react-navigation/native';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { COLLECTION_SCREEN } from 'Navigation/navigationRoutes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { SearchableCategoryInterface } from 'Type/SearchableCategoryInterface.interface';
import { safeJsonParse } from 'Util/Json';
import { setTimeoutSafe } from 'Util/Misc';
import { navigate } from 'Util/Navigation';
import { queryKeys, STALE_TIME } from 'Util/Query';
import { openCategory } from 'Util/Router';
import { storage } from 'Util/Storage';

import SearchScreenComponent from './SearchScreen.component';
import SearchScreenComponentTV from './SearchScreen.component.atv';
import { MAX_USER_SUGGESTIONS, SEARCH_DEBOUNCE_TIME, SEARCH_MENU_ITEM, USER_SUGGESTIONS } from './SearchScreen.config';

const loadUserSuggestions = (): string[] => (
  safeJsonParse<string[]>(storage.getMiscStorage().loadString(USER_SUGGESTIONS), []) || []
);

export function SearchScreenContainer() {
  const isTV = useIsTV();
  const [query, setQuery] = useState('');
  const navigation = useNavigation();
  const [userSuggestions, setUserSuggestions] = useState<string[]>(loadUserSuggestions);
  // the debounced text the remote suggestions are fetched for
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [enteredText, setEnteredText] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const debounce = useRef<number | null>(null);
  const { currentService } = useServiceContext();
  const searchMenuItems = useMemo(() => [SEARCH_MENU_ITEM], []);

  const { pagerItems, isLoading, onPreLoad, onNextLoad } = useFilmPager({
    queryKey: queryKeys.films.search(query),
    menuItems: searchMenuItems,
    fetchFilms: (_menuItem, page) => currentService.search(query, page),
    enabled: !!query,
  });
  const confirmationOverlayRef = useRef<ThemedOverlayRef>(null);

  const additionalContentOverlayRef = useRef<ThemedOverlayRef>(null);
  const [isAdditionalContentRequested, setIsAdditionalContentRequested] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [pickedGenre, setPickedGenre] = useState<string | null>(null);
  const [pickedYear, setPickedYear] = useState<string | null>(null);

  const { data: remoteSuggestions } = useQuery({
    queryKey: queryKeys.search.suggestions(suggestionQuery),
    queryFn: () => currentService.searchSuggestions(suggestionQuery),
    enabled: !!suggestionQuery,
    // keep the previous list visible while the next one is in flight
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.MEDIUM,
  });

  const { data: categories = null, isLoading: isCategoriesLoading } = useQuery({
    queryKey: queryKeys.search.additionalContent(),
    queryFn: () => currentService.loadAdditionalContent(),
    // the overlay is what triggers the (one time) load
    enabled: isAdditionalContentRequested,
    staleTime: Infinity,
  });

  // the pickers default to the first category and its first genre/year, so the
  // selection is derived rather than seeded once the content arrives
  const selectedCategory = useMemo(() => {
    if (!categories?.length) {
      return null;
    }

    return categories.find(({ name }) => name === selectedCategoryName) ?? categories[0];
  }, [categories, selectedCategoryName]);

  const selectedGenre = pickedGenre ?? selectedCategory?.genres[0]?.value ?? null;
  const selectedYear = pickedYear ?? selectedCategory?.years[0]?.value ?? null;

  useEffect(() => () => {
    if (debounce.current) {
      clearTimeout(debounce.current);
    }
  }, []);

  const suggestions = suggestionQuery ? remoteSuggestions ?? userSuggestions : userSuggestions;

  const updateUserSuggestions = (q: string) => {
    const newArray = [q, ...loadUserSuggestions()];
    const mArray = new Set(newArray);
    const uniqueArray = [...mArray];

    storage.getMiscStorage().save(
      USER_SUGGESTIONS,
      uniqueArray.slice(0, MAX_USER_SUGGESTIONS)
    );
  };

  const onApplySuggestion = async (q: string) => {
    if (!q) {
      return;
    }

    setQuery(q);
    setEnteredText(q);
    updateUserSuggestions(q);
    setUserSuggestions(loadUserSuggestions());

    Keyboard.dismiss();
  };

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    // interimResults is on, so partial transcripts arrive too - acting on those
    // would fire a search and persist a user suggestion for every fragment
    if (!event.isFinal) {
      return;
    }

    onApplySuggestion(event.results[0]?.transcript);
  });

  const onChangeText = async (q: string) => {
    resetSearch();
    setEnteredText(q);

    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    if (!q) {
      // an empty suggestion query falls back to the stored user suggestions
      setSuggestionQuery('');

      return;
    }

    debounce.current = setTimeoutSafe(() => {
      setSuggestionQuery(q);
    }, SEARCH_DEBOUNCE_TIME);
  };

  const handleApplySearch = () => {
    onApplySearch(enteredText);
  };

  const onApplySearch = async (q: string) => {
    if (!q) {
      return;
    }

    Keyboard.dismiss();

    // setting the query starts the search: it is part of the films query key
    setQuery(q);
    setEnteredText(q);
    updateUserSuggestions(q);
    setUserSuggestions(loadUserSuggestions());
  };

  const resetSearch = () => {
    // clearing the query changes the films query key, so the shown films reset automatically
    if (query) {
      setQuery('');
    }
  };

  const clearSearch = () => {
    setEnteredText('');
    setSuggestionQuery('');
    resetSearch();
  };

  const handleStartRecognition = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!result.granted) {
      NotificationStore.displayError('Permissions not granted');

      return;
    }

    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();

      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'ru-RU', // 'en-US',
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
    });
  };

  const openAdditionalContentOverlay = () => {
    additionalContentOverlayRef.current?.open();
    setIsAdditionalContentRequested(true);
  };

  const handleSelectCategory = (cat: SearchableCategoryInterface) => {
    setSelectedCategoryName(cat.name);
    // clearing the picks falls back to the new category's first genre/year
    setPickedGenre(null);
    setPickedYear(null);
  };

  const handleApplyAdditionalContent = () => {
    additionalContentOverlayRef.current?.close();

    let url = '';

    if (selectedYear === '-1') {
      url = (selectedGenre ?? '').replace('/best', '');
    } else if (selectedYear === '0') {
      url = selectedGenre ?? '';
    } else {
      url = `${selectedGenre}${selectedYear}`;
    }

    openCategory(url, navigation);
  };

  const handleOpenCollections = () => {
    navigate(COLLECTION_SCREEN);
  };

  const suggestionToRemove = useRef<string | null>(null);

  // Only the stored history can be removed: while the input has text the list
  // shows the service's suggestions instead, and those are not ours to delete.
  const isRemovableSuggestion = useCallback(
    (suggestion: string) => userSuggestions.includes(suggestion),
    [userSuggestions]
  );

  const handleRemoveSuggestion = (suggestion: string) => {
    if (!isRemovableSuggestion(suggestion)) {
      return;
    }

    suggestionToRemove.current = suggestion;
    confirmationOverlayRef.current?.open();
  };

  const removeSuggestion = () => {
    if (!suggestionToRemove.current) {
      return;
    }

    const newSuggestions = loadUserSuggestions().filter((s) => s !== suggestionToRemove.current);
    storage.getMiscStorage().save(
      USER_SUGGESTIONS,
      newSuggestions
    );
    setUserSuggestions(newSuggestions);
    suggestionToRemove.current = null;
    confirmationOverlayRef.current?.close();
  };

  const containerProps = {
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
    handleApplyAdditionalContent,
    handleOpenCollections,
    setSelectedCategory: handleSelectCategory,
    setSelectedGenre: setPickedGenre,
    setSelectedYear: setPickedYear,
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
    isRemovableSuggestion,
    handleRemoveSuggestion,
    removeSuggestion,
  };

  return isTV ? <SearchScreenComponentTV { ...containerProps } /> : <SearchScreenComponent { ...containerProps } />;

}

export default SearchScreenContainer;
