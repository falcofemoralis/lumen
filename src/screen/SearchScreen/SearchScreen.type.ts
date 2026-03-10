import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { SearchableCategoryInterface } from 'Type/SearchableCategoryInterface.interface';

export interface SearchScreenComponentProps {
  suggestions: string[];
  pagerItems: PagerItemInterface[];
  query: string;
  recognizing: boolean;
  enteredText: string;
  isLoading: boolean;
  additionalContentOverlayRef: React.RefObject<any>;
  categories: SearchableCategoryInterface[] | null;
  selectedCategory: SearchableCategoryInterface | null;
  selectedGenre: string | null;
  selectedYear: string | null;
  isCategoriesLoading: boolean;
  confirmationOverlayRef: React.RefObject<any>;
  handleApplyAdditionalContent: () => void;
  handleOpenCollections: () => void;
  setSelectedCategory: (category: SearchableCategoryInterface) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedYear: (year: string) => void;
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
  openAdditionalContentOverlay: () => void;
  handleRemoveSuggestion: (suggestion: string) => void;
  removeSuggestion: () => void;
}
