import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface SearchPageComponentProps {
  suggestions: string[];
  filmPager: FilmPagerInterface;
  query: string;
  recognizing: boolean;
  loadSuggestions: (q: string) => void;
  onApplySuggestion: (q: string) => void;
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => Promise<FilmListInterface>;
  onUpdateFilms: (key: string, filmList: FilmListInterface) => void;
  handleStartRecognition: () => void;
  handleApplySearch: () => void;
}
