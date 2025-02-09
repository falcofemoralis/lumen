import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { withTV } from 'Hooks/withTV';
import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { miscStorage } from 'Util/Storage';

import SearchPageComponent from './SearchPage.component';
import SearchPageComponentTV from './SearchPage.component.atv';
import { MAX_USER_SUGGESTIONS, SEARCH_DEBOUNCE_TIME, USER_SUGGESTIONS } from './SearchPage.config';

export function SearchPageContainer() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(
    miscStorage.getArray(USER_SUGGESTIONS) || [],
  );
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});
  const [enteredText, setEnteredText] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const debounce = useRef<NodeJS.Timeout | undefined>();

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    onApplySuggestion(event.results[0]?.transcript);
  });

  const onChangeText = async (q: string) => {
    resetSearch();
    setEnteredText(q);

    if (!q) {
      clearTimeout(debounce.current);
      setSuggestions(miscStorage.getArray(USER_SUGGESTIONS) || []);

      return;
    }

    clearTimeout(debounce.current);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    debounce.current = setTimeout(async () => {
      console.log('searching suggestions');

      try {
        const res = await ServiceStore.getCurrentService().searchSuggestions(q);

        setSuggestions(res);
      } catch (e) {
        NotificationStore.displayError(e as Error);
      }
    }, SEARCH_DEBOUNCE_TIME);
  };

  const handleApplySearch = () => {
    onApplySuggestion(enteredText);
  };

  const onApplySuggestion = async (q: string) => {
    if (!q) {
      return;
    }

    Keyboard.dismiss();

    setQuery(q);
    setEnteredText(q);
    updateUserSuggestions(q);

    try {
      const films = await ServiceStore.getCurrentService().search(q, 1);

      onUpdateFilms('search', films);
    } catch (e) {
      NotificationStore.displayError(e as Error);
    }
  };

  const updateUserSuggestions = (q: string) => {
    const userSuggestions = miscStorage.getArray(USER_SUGGESTIONS) || [];

    const newArray = [q, ...userSuggestions];
    const mArray = new Set(newArray);
    const uniqueArray = [...mArray];

    miscStorage.setArrayAsync(
      USER_SUGGESTIONS,
      uniqueArray.slice(0, MAX_USER_SUGGESTIONS),
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
    setSuggestions(miscStorage.getArray(USER_SUGGESTIONS) || []);
    resetSearch();
  };

  const handleStartRecognition = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!result.granted) {
      NotificationStore.displayError('Permissions not granted');

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
    currentPage: number,
  ) => ServiceStore.getCurrentService().search(query, currentPage);

  const onUpdateFilms = async (key: string, filmList: FilmListInterface) => {
    setFilmPager((prevFilmPager) => ({
      ...prevFilmPager,
      [key]: {
        filmList,
      },
    }));
  };

  const containerFunctions = {
    onChangeText,
    onApplySuggestion,
    onLoadFilms,
    onUpdateFilms,
    handleStartRecognition,
    handleApplySearch,
    resetSearch,
    clearSearch,
  };

  const containerProps = () => ({
    suggestions,
    filmPager,
    query,
    recognizing,
    enteredText,
  });

  return withTV(SearchPageComponentTV, SearchPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default SearchPageContainer;
