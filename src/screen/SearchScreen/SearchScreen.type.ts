import { FilmPagerHandlers, PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { RefObject } from 'react';
import { SearchableCategoryInterface } from 'Type/SearchableCategoryInterface.interface';

export interface SearchScreenComponentProps extends FilmPagerHandlers {
  suggestions: string[];
  pagerItems: PagerItemInterface[];
  query: string;
  recognizing: boolean;
  enteredText: string;
  isLoading: boolean;
  additionalContentOverlayRef: RefObject<any>;
  categories: SearchableCategoryInterface[] | null;
  selectedCategory: SearchableCategoryInterface | null;
  selectedGenre: string | null;
  selectedYear: string | null;
  isCategoriesLoading: boolean;
  confirmationOverlayRef: RefObject<any>;
  handleApplyAdditionalContent: () => void;
  handleOpenCollections: () => void;
  setSelectedCategory: (category: SearchableCategoryInterface) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedYear: (year: string) => void;
  onChangeText: (q: string) => void;
  onApplySearch: (q: string) => void;
  onApplySuggestion: (q: string) => void;
  handleStartRecognition: () => void;
  handleApplySearch: () => void;
  resetSearch: () => void;
  clearSearch: () => void;
  openAdditionalContentOverlay: () => void;
  handleRemoveSuggestion: (suggestion: string) => void;
  removeSuggestion: () => void;
}
