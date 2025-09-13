import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { useServiceContext } from 'Context/ServiceContext';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { withTV } from 'Hooks/withTV';
import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { safeJsonParse } from 'Util/Json';
import { setTimeoutSafe } from 'Util/Misc';
import { miscStorage } from 'Util/Storage';

import SearchPageComponent from './SearchPage.component';
import SearchPageComponentTV from './SearchPage.component.atv';
import { MAX_USER_SUGGESTIONS, SEARCH_DEBOUNCE_TIME, USER_SUGGESTIONS } from './SearchPage.config';

export function SearchPageContainer() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(
    safeJsonParse(miscStorage.getString(USER_SUGGESTIONS), []) || []
  );
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});
  const [enteredText, setEnteredText] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const { currentService } = useServiceContext();

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    onApplySuggestion(event.results[0]?.transcript);
  });

  const searchSuggestions = async (q: string) => {
    try {
      LoggerStore.debug('searchSuggestions', { q });

      const res = await currentService.searchSuggestions(q);

      setSuggestions(res);
    } catch (error) {
      LoggerStore.error('searchSuggestions', { error });

      NotificationStore.displayError(error as Error);
    }
  };

  const search = async (q: string) => {
    if (!q) {
      return;
    }

    setIsLoading(true);

    try {
      LoggerStore.debug('search', { q });

      const films = await currentService.search(q, 1);

      onUpdateFilms('search', films);
    } catch (error) {
      LoggerStore.error('search', { error });

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
      setSuggestions(safeJsonParse(miscStorage.getString(USER_SUGGESTIONS), []) || []);

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

    LoggerStore.debug('onApplySearch', { q });

    search(q);
  };

  const onApplySuggestion = async (q: string) => {
    if (!q) {
      return;
    }

    setQuery(q);
    setEnteredText(q);
    updateUserSuggestions(q);

    LoggerStore.debug('onApplySuggestion', { q });

    search(q);
  };

  const updateUserSuggestions = (q: string) => {
    const userSuggestions = safeJsonParse(miscStorage.getString(USER_SUGGESTIONS), []) || [];

    const newArray = [q, ...userSuggestions];
    const mArray = new Set(newArray);
    const uniqueArray = [...mArray];

    miscStorage.set(
      USER_SUGGESTIONS,
      JSON.stringify(uniqueArray.slice(0, MAX_USER_SUGGESTIONS))
    );
  };

  const resetSearch = () => {
    if (filmPager.search?.filmList.films.length) {
      onUpdateFilms('search', { films: [], totalPages: 1 });
    }

    if (query) {
      setQuery('');
    }
  };

  const clearSearch = () => {
    setEnteredText('');
    setSuggestions(safeJsonParse(miscStorage.getString(USER_SUGGESTIONS), []) || []);
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

  const onUpdateFilms = async (key: string, filmList: FilmListInterface) => {
    setFilmPager((prevFilmPager) => ({
      ...prevFilmPager,
      [key]: {
        filmList,
      },
    }));
  };

  const containerProps = () => ({
    suggestions,
    filmPager,
    query,
    recognizing,
    enteredText,
    isLoading,
  });

  const containerFunctions = {
    onChangeText,
    onApplySearch,
    onApplySuggestion,
    onLoadFilms,
    onUpdateFilms,
    handleStartRecognition,
    handleApplySearch,
    resetSearch,
    clearSearch,
  };

  return withTV(SearchPageComponentTV, SearchPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default SearchPageContainer;
