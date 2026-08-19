import { useNavigation } from '@react-navigation/native';
import { useConfigContext, useHiddenCountries } from 'Context/ConfigContext';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { isFilmCardHidden } from 'Util/Film';
import { noopFn } from 'Util/Function';
import { openFilm } from 'Util/Router';

import FilmGridComponent from './FilmGrid.component';
import FilmGridComponentTV from './FilmGrid.component.atv';
import {
  SECTION_THUMBNAILS_ROWS,
  SECTION_THUMBNAILS_ROWS_TV,
  THUMBNAILS_ROWS,
  THUMBNAILS_ROWS_TV,
} from './FilmGrid.config';
import {
  FilmGridContainerProps,
  FilmGridItem,
  FilmGridItemType,
  FilmGridSection,
} from './FilmGrid.type';

const createPlaceholders = (amount: number): FilmCardInterface[] => (
  new Array(amount).fill(null).map((_, index) => ({
    id: `film-placeholder-${index}`,
    link: '',
    type: FilmType.FILM,
    poster: '',
    title: '',
    subtitle: '',
  }))
);

export function FilmGridContainer({
  films,
  sections,
  isEmpty,
  hideGrid,
  onNextLoad,
  ...props
}: FilmGridContainerProps) {
  const navigation = useNavigation();
  const { isTV, numberOfColumnsMobile, numberOfColumnsTV } = useConfigContext();
  const hiddenCountries = useHiddenCountries();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updatingStateRef = useRef(false);

  const numberOfColumns = isTV ? numberOfColumnsTV : numberOfColumnsMobile;
  const isSectioned = sections !== undefined;

  const handleOnPress = useCallback((film: FilmCardInterface) => {
    // A hidden card is still focusable, so that the grid keeps its shape -- but
    // opening the film it covers would defeat the point of covering it.
    if (isFilmCardHidden(film, hiddenCountries)) {
      return;
    }

    openFilm(film, navigation);
  }, [navigation, hiddenCountries]);

  // Flatten the films -- grouped or not -- into the mixed header/film list
  // FlashList wants for section lists, plus the positions of the headers
  // within it.
  const { data, stickyHeaderIndices, hasFilms } = useMemo(() => {
    const items: FilmGridItem[] = [];
    const headerIndices: number[] = [];

    if (isEmpty || hideGrid) {
      return { data: items, stickyHeaderIndices: headerIndices, hasFilms: false };
    }

    const source: FilmGridSection[] = sections ?? [{ header: '', films: films ?? [] }];
    const isLoaded = source.some(({ films: sectionFilms }) => sectionFilms.length > 0);

    const thumbnailRows = isSectioned
      ? (isTV ? SECTION_THUMBNAILS_ROWS_TV : SECTION_THUMBNAILS_ROWS)
      : (isTV ? THUMBNAILS_ROWS_TV : THUMBNAILS_ROWS);

    // Nothing to show yet -- fill the grid with loading cards instead.
    const filledSource: FilmGridSection[] = isLoaded ? source : [{
      header: '',
      films: createPlaceholders(numberOfColumns * thumbnailRows),
      isPlaceholder: true,
    }];

    // Runs across sections: a section always starts on a fresh line, so the row
    // simply advances whenever a card lands in column 0.
    let row = -1;

    filledSource.forEach(({ header, films: sectionFilms, isPlaceholder = false }, sectionIndex) => {
      // Where the section starts: its header when it has one, otherwise its
      // first row -- what focus/scroll should reveal for that section.
      const sectionStart = items.length;

      if (header && !isPlaceholder) {
        headerIndices.push(sectionStart);
        items.push({
          type: FilmGridItemType.HEADER,
          key: `film-grid-header-${sectionIndex}`,
          header,
        });
      }

      // Each card is a separate item, laid out by FlashList's `numColumns`
      // grid -- what spatial navigation needs to focus a single card.
      sectionFilms.forEach((film, filmIndex) => {
        const column = filmIndex % numberOfColumns;
        // Index of the first card of the row this card lands in.
        const rowStart = items.length - column;

        if (column === 0) {
          row += 1;
        }

        items.push({
          type: FilmGridItemType.FILM,
          key: `film-grid-${sectionIndex}-${filmIndex}-${film.id}`,
          film,
          isPlaceholder,
          // Scroll the header into view together with the section's first row.
          scrollIndex: filmIndex < numberOfColumns ? sectionStart : rowStart,
          row,
          column,
        });
      });
    });

    return { data: items, stickyHeaderIndices: headerIndices, hasFilms: isLoaded };
  }, [films, sections, isSectioned, isEmpty, hideGrid, isTV, numberOfColumns]);

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh = false) => {
    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      onLoading(true);

      try {
        if (onNextLoad) {
          await onNextLoad(isRefresh);
        }
      } finally {
        onLoading(false);
        requestAnimationFrame(() => {
          setTimeout(() => {
            updatingStateRef.current = false;
          }, 50);
        });
      }
    }
  };

  const handleScrollEnd = async () => {
    loadNextPage(noopFn);
  };

  const handleRefresh = async () => {
    loadNextPage((state) => setIsRefreshing(state), true);
  };

  const containerProps = {
    data,
    stickyHeaderIndices,
    hasFilms,
    isSectioned,
    numberOfColumns,
    isRefreshing,
    isEmpty,
    hideGrid,
    handleOnPress,
    // A grid without a loader has nothing to paginate or to refresh.
    handleScrollEnd: onNextLoad ? handleScrollEnd : undefined,
    handleRefresh: onNextLoad ? handleRefresh : undefined,
    ...props,
  };

  return isTV ? <FilmGridComponentTV { ...containerProps } /> : <FilmGridComponent { ...containerProps } />;

}

export default FilmGridContainer;
