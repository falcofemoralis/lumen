import { useNavigation } from '@react-navigation/native';
import { pagerItemsUpdater } from 'Component/FilmPager/FilmPager.config';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { COLLECTION_SCREEN } from 'Navigation/navigationRoutes';
import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { SearchableCategoryInterface } from 'Type/SearchableCategoryInterface.interface';
import { safeJsonParse } from 'Util/Json';
import { setTimeoutSafe } from 'Util/Misc';
import { navigate } from 'Util/Navigation';
import { openCategory } from 'Util/Router';
import { storage } from 'Util/Storage';

import SearchScreenComponent from './SearchScreen.component';
import SearchScreenComponentTV from './SearchScreen.component.atv';
import { MAX_USER_SUGGESTIONS, SEARCH_DEBOUNCE_TIME, SEARCH_MENU_ITEM, USER_SUGGESTIONS } from './SearchScreen.config';

export function SearchScreenContainer() {
  const { isTV } = useConfigContext();
  const [query, setQuery] = useState('');
  const navigation = useNavigation();
  const [suggestions, setSuggestions] = useState<string[]>(
    safeJsonParse(storage.getMiscStorage().loadString(USER_SUGGESTIONS), []) || []
  );
  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>([{
    menuItem: SEARCH_MENU_ITEM,
    films: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }]);
  const [enteredText, setEnteredText] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const { currentService } = useServiceContext();
  const confirmationOverlayRef = useRef<ThemedOverlayRef>(null);

  const additionalContentOverlayRef = useRef<ThemedOverlayRef>(null);
  const [categories, setCategories] = useState<SearchableCategoryInterface[] | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchableCategoryInterface | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const isLoadingAdditionalContentRef = useRef(false);
  const isLoadedAdditionalContentRef = useRef(false);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    onApplySuggestion(event.results[0]?.transcript);
  });

  const searchSuggestions = async (q: string) => {
    try {
      const res = await currentService.searchSuggestions(q);

      setSuggestions(res);
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  };

  const search = async (q: string) => {
    if (!q) {
      return;
    }

    setIsLoading(true);

    try {
      const page = 1;

      const filmsList = await currentService.search(q, page);

      onUpdateFilms('search', {
        ...pagerItems[0],
        films: filmsList.films,
        pagination: {
          currentPage: page,
          totalPages: filmsList.totalPages,
        },
      });
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeText = async (q: string) => {
    resetSearch();
    setEnteredText(q);

    if (!q) {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
      setSuggestions(safeJsonParse(storage.getMiscStorage().loadString(USER_SUGGESTIONS), []) || []);

      return;
    }

    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    debounce.current = setTimeoutSafe(async () => {
      await searchSuggestions(q);
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

    setQuery(q);
    setEnteredText(q);
    updateUserSuggestions(q);

    search(q);
  };

  const onApplySuggestion = async (q: string) => {
    if (!q) {
      return;
    }

    setQuery(q);
    setEnteredText(q);
    updateUserSuggestions(q);

    search(q);

    Keyboard.dismiss();
  };

  const updateUserSuggestions = (q: string) => {
    const userSuggestions = safeJsonParse(storage.getMiscStorage().loadString(USER_SUGGESTIONS), []) || [];

    const newArray = [q, ...userSuggestions];
    const mArray = new Set(newArray);
    const uniqueArray = [...mArray];

    storage.getMiscStorage().save(
      USER_SUGGESTIONS,
      uniqueArray.slice(0, MAX_USER_SUGGESTIONS)
    );
  };

  const resetSearch = () => {
    if (pagerItems[0]?.films?.length) {
      onUpdateFilms('search', {
        ...pagerItems[0],
        films: null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
        },
      });
    }

    if (query) {
      setQuery('');
    }
  };

  const clearSearch = () => {
    setEnteredText('');
    setSuggestions(safeJsonParse(storage.getMiscStorage().loadString(USER_SUGGESTIONS), []) || []);
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

  const onLoadFilms = async (
    _menuItem: MenuItemInterface,
    currentPage: number
  ) => currentService.search(query, currentPage);

  const onUpdateFilms = async (key: string, item: PagerItemInterface) => {
    setPagerItems(pagerItemsUpdater(key, item));
  };

  const openAdditionalContentOverlay = () => {
    additionalContentOverlayRef.current?.open();

    if (isLoadedAdditionalContentRef.current || isLoadingAdditionalContentRef.current) {
      return;
    }

    isLoadingAdditionalContentRef.current = true;
    setIsCategoriesLoading(true);

    currentService.loadAdditionalContent()
      .then((cats) => {
        if (cats.length > 0) {
          const firstCat = cats[0];
          setCategories(cats);
          setSelectedCategory(firstCat);

          if (firstCat.genres.length > 0) {
            setSelectedGenre(firstCat.genres[0].value);
          }

          if (firstCat.years.length > 0) {
            setSelectedYear(firstCat.years[0].value);
          }
        }
      })
      .finally(() => {
        setIsCategoriesLoading(false);
        isLoadingAdditionalContentRef.current = false;
        isLoadedAdditionalContentRef.current = true;
      });
  };

  const handleSelectCategory = (cat: SearchableCategoryInterface) => {
    setSelectedCategory(cat);

    if (cat.genres.length > 0) {
      setSelectedGenre(cat.genres[0].value);
    }

    if (cat.years.length > 0) {
      setSelectedYear(cat.years[0].value);
    }
  };

  const handleApplyAdditionalContent = () => {
    additionalContentOverlayRef.current?.close();

    const url = selectedYear !== '0' ? `${selectedGenre}${selectedYear}` : selectedGenre ?? '';

    openCategory(url, navigation);
  };

  const handleOpenCollections = () => {
    navigate(COLLECTION_SCREEN);
  };

  const suggestionToRemove = useRef<string | null>(null);

  const handleRemoveSuggestion = (suggestion: string) => {
    suggestionToRemove.current = suggestion;
    confirmationOverlayRef.current?.open();
  };

  const removeSuggestion = () => {
    if (!suggestionToRemove.current) {
      return;
    }

    const userSuggestions = safeJsonParse(storage.getMiscStorage().loadString(USER_SUGGESTIONS), []) || [];
    const newSuggestions = userSuggestions.filter((s: string) => s !== suggestionToRemove.current);
    storage.getMiscStorage().save(
      USER_SUGGESTIONS,
      newSuggestions
    );
    setSuggestions(newSuggestions);
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
    setSelectedGenre,
    setSelectedYear,
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
    handleRemoveSuggestion,
    removeSuggestion,
  };

  return isTV ? <SearchScreenComponentTV { ...containerProps } /> : <SearchScreenComponent { ...containerProps } />;

}

export default SearchScreenContainer;
