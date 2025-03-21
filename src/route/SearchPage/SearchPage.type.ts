import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface SearchPageComponentProps {
  suggestions: string[];
  filmPager: FilmPagerInterface;
  query: string;
  recognizing: boolean;
  enteredText: string;
  isLoading: boolean;
  onChangeText: (q: string) => void;
  onApplySearch: (q: string) => void;
  onApplySuggestion: (q: string) => void;
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => Promise<FilmListInterface>;
  onUpdateFilms: (key: string, filmList: FilmListInterface) => void;
  handleStartRecognition: () => void;
  handleApplySearch: () => void;
  resetSearch: () => void;
  clearSearch: () => void;
}
