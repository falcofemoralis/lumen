import { useNavigation } from '@react-navigation/native';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { FilmPagerQueryData, useFilmPager } from 'Component/FilmPager/useFilmPager';
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
import { unifiedSearchService, ContentSource } from '../../source';
import { ContentFilters, matchesContentFilters } from '../../source/search/ContentFilters';
import { FilmType } from 'Type/FilmType.type';
import { FILM_COUNTRY_OPTIONS } from '../SettingsScreen/SettingsScreen.config';
import { openCategory } from 'Util/Router';
import { storage } from 'Util/Storage';
import { consumeTvSearchRequest, subscribeToTvSearchRequests } from 'Util/TvSearch/request';

import SearchScreenComponent from './SearchScreen.component';
import SearchScreenComponentTV from './SearchScreen.component.atv';
import { MAX_USER_SUGGESTIONS, SEARCH_DEBOUNCE_TIME, SEARCH_MENU_ITEM, USER_SUGGESTIONS } from './SearchScreen.config';

const loadUserSuggestions = (): string[] => (
  safeJsonParse<string[]>(storage.getMiscStorage().loadString(USER_SUGGESTIONS), []) || []
);

export function SearchScreenContainer() {
  const isTV = useIsTV();
  // a search handed to the app from outside (the Android TV search box) is waiting by
  // the time this mounts, since opening the screen is how it got here
  const [query, setQuery] = useState(consumeTvSearchRequest);
  const navigation = useNavigation();
  const [userSuggestions, setUserSuggestions] = useState<string[]>(loadUserSuggestions);
  // the debounced text the remote suggestions are fetched for
  const [suggestionQuery, setSuggestionQuery] = useState('');
  // seeded from the query above, so an externally requested search also shows in the input
  const [enteredText, setEnteredText] = useState(query);
  const [recognizing, setRecognizing] = useState(false);
  const debounce = useRef<number | null>(null);
  const { currentService } = useServiceContext();
  const searchMenuItems = useMemo(() => [SEARCH_MENU_ITEM], []);
  const queryClient = useQueryClient();
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [includedCountries, setIncludedCountries] = useState<string[]>([]);
  const [allowedCountries, setAllowedCountries] = useState(FILM_COUNTRY_OPTIONS.map((country) => country.value));
  const [activeFilters, setActiveFilters] = useState<(ContentFilters & {
    query: string; path: string; zonaPath: string;
  }) | null>(null);
  const resultKey = activeFilters ? 'filters:' + JSON.stringify(activeFilters) : query;

  const { pagerItems, isLoading, onPreLoad, onNextLoad } = useFilmPager({
    queryKey: queryKeys.films.search(resultKey),
    menuItems: searchMenuItems,
    fetchFilms: (menuItem, page, sort) => unifiedSearchService.search(resultKey, page, (updates) => {
      if (!updates.length) return;
      queryClient.setQueryData<FilmPagerQueryData>(
        [...queryKeys.films.search(resultKey), menuItem.id, sort ?? null],
        (previous) => previous ? {
          ...previous,
          films: previous.films.map((card) => (
            updates.find((update) => update.previousLink === card.link)?.card ?? card
          )),
        } : previous,
      );
    }, activeFilters ? {
      loadSource: (adapter, sourcePage) => activeFilters.query
        ? adapter.search(activeFilters.query, sourcePage)
        : adapter.source === ContentSource.ZONA
          ? adapter.getFilms!(activeFilters.zonaPath, sourcePage)
          : currentService.getFilms(sourcePage, activeFilters.path, {}),
      prepareCard: async (card, adapter) => {
        const film = await adapter.getFilm(card.link);
        if (!film || !matchesContentFilters(film, activeFilters)) return null;
        return {
          ...card, type: film.type, originalTitle: film.originalTitle,
          externalIds: film.externalIds, subtitle: film.releaseDate ?? card.subtitle,
          ratings: { ...card.ratings, ...Object.fromEntries((film.ratings ?? []).flatMap((rating) =>
            rating.name === 'IMDb' ? [['imdb', rating.rating]]
              : rating.name === 'Кинопоиск' ? [['kinopoisk', rating.rating]] : [])) },
          info: film.seriesInfo ?? card.info,
        };
      },
    } : undefined, (partial) => {
      queryClient.setQueryData<FilmPagerQueryData>(
        [...queryKeys.films.search(resultKey), menuItem.id, sort ?? null],
        { films: partial.films, currentPage: 1, totalPages: 1 },
      );
    }),
    enabled: !!query || !!activeFilters,
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
    retry: false,
    meta: { silent: true },
    // keep the previous list visible while the next one is in flight
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.MEDIUM,
  });

  const { data: categories = null, isLoading: isCategoriesLoading } = useQuery({
    queryKey: queryKeys.search.additionalContent(),
    queryFn: () => currentService.loadAdditionalContent().catch(() => [
      { name: 'Фильмы', genres: [{ name: 'Все жанры', value: '/films/' }], years: [] },
      { name: 'Сериалы', genres: [{ name: 'Все жанры', value: '/series/' }], years: [] },
      { name: 'Мультфильмы', genres: [{ name: 'Все жанры', value: '/cartoons/' }], years: [] },
      { name: 'Аниме', genres: [{ name: 'Все жанры', value: '/animation/' }], years: [] },
    ]),
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

  // The screen stays mounted once its tab has been visited, so a later search handed
  // over from outside finds it already open and the seeding above has long happened.
  useEffect(() => subscribeToTvSearchRequests((requestedQuery) => {
    setQuery(requestedQuery);
    setEnteredText(requestedQuery);
  }), []);

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
    setActiveFilters(null);
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
    setActiveFilters(null);
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
    if (yearFrom && yearTo && Number(yearFrom) > Number(yearTo)) {
      NotificationStore.displayMessage('Начальный год не должен быть больше конечного');
      return;
    }
    const category = selectedCategory?.name.toLowerCase() ?? '';
    const type = category.includes('аниме') ? FilmType.ANIME
      : category.includes('мульт') ? FilmType.CARTOON
        : category.includes('сериал') ? FilmType.SERIES
          : category.includes('фильм') ? FilmType.FILM : undefined;
    const genreName = selectedCategory?.genres.find((genre) => genre.value === selectedGenre)?.name;
    const genre = genreName && !/все|all/i.test(genreName) ? genreName : undefined;
    setActiveFilters({
      query: enteredText.trim(),
      path: yearFrom && yearFrom === yearTo && selectedGenre?.includes('/best')
        ? selectedGenre + yearFrom : (selectedGenre ?? '/films/').replace('/best', ''),
      zonaPath: 'https://w1.zona.im/' + (type === FilmType.SERIES ? 'tvseries'
        : type === FilmType.CARTOON ? 'movies/filter/genre-multfilm'
          : type === FilmType.ANIME ? 'movies/filter/genre-anime' : 'movies'),
      from: yearFrom ? Number(yearFrom) : undefined,
      to: yearTo ? Number(yearTo) : undefined,
      type, genre,
      includedCountries,
      excludedCountries: FILM_COUNTRY_OPTIONS.filter((country) => !allowedCountries.includes(country.value)).map((country) => country.value),
    });
    additionalContentOverlayRef.current?.close();
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
    yearFrom, yearTo, includedCountries, allowedCountries,
    countryOptions: FILM_COUNTRY_OPTIONS,
    setYearFrom, setYearTo, setIncludedCountries, setAllowedCountries,
    filtersApplied: Boolean(activeFilters),
    suggestions,
    pagerItems,
    query: activeFilters ? resultKey : query,
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
