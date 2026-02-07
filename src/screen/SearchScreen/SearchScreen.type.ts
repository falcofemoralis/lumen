import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface SearchScreenComponentProps {
  suggestions: string[];
  pagerItems: PagerItemInterface[];
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
  onUpdateFilms: (
    key: string,
    item: PagerItemInterface
  ) => void;
  handleStartRecognition: () => void;
  handleApplySearch: () => void;
  resetSearch: () => void;
  clearSearch: () => void;
}
