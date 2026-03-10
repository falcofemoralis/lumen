export interface SearchableCategoryItem {
  name: string;
  value: string;
}

export interface SearchableCategoryInterface {
  name: string;
  genres: SearchableCategoryItem[];
  years: SearchableCategoryItem[];
}
