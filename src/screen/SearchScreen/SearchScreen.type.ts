import { FilmPagerHandlers, PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { RefObject } from 'react';
import { SearchableCategoryInterface } from 'Type/SearchableCategoryInterface.interface';

export interface SearchScreenComponentProps extends FilmPagerHandlers {
  selectedFormats: string[];
  formatOptions: { value: string; label: string }[];
  setSelectedFormats: (values: string[]) => void;
  yearFrom: string;
  yearTo: string;
  selectedGenres: string[];
  genreOptions: { value: string; label: string }[];
  allowedCountries: string[];
  countryOptions: { value: string; label: string }[];
  setYearFrom: (value: string) => void;
  setYearTo: (value: string) => void;
  setSelectedGenres: (values: string[]) => void;
  setAllowedCountries: (values: string[]) => void;
  filtersApplied: boolean;
  suggestions: string[];
  pagerItems: PagerItemInterface[];
  query: string;
  recognizing: boolean;
  enteredText: string;
  isLoading: boolean;
  additionalContentOverlayRef: RefObject<any>;
  categories: SearchableCategoryInterface[] | null;
  selectedCategory: SearchableCategoryInterface | null;

  isCategoriesLoading: boolean;
  confirmationOverlayRef: RefObject<any>;
  handleApplyAdditionalContent: () => void;
  handleOpenCollections: () => void;
  setSelectedCategory: (category: SearchableCategoryInterface) => void;

  onChangeText: (q: string) => void;
  onApplySearch: (q: string) => void;
  onApplySuggestion: (q: string) => void;
  handleStartRecognition: () => void;
  handleApplySearch: () => void;
  resetSearch: () => void;
  clearSearch: () => void;
  openAdditionalContentOverlay: () => void;
  isRemovableSuggestion: (suggestion: string) => boolean;
  handleRemoveSuggestion: (suggestion: string) => void;
  removeSuggestion: () => void;
}
