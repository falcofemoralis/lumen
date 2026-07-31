import { useNavigation } from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import { useCallback, useMemo } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { openFilm } from 'Util/Router';

import FilmSectionsComponent from './FilmSections.component';
import FilmSectionsComponentTV from './FilmSections.component.atv';
import { THUMBNAILS_ROWS, THUMBNAILS_ROWS_TV } from './FilmSections.config';
import {
  FilmSectionsContainerProps,
  FilmSectionsData,
  FilmSectionsItem,
  FilmSectionsItemType,
} from './FilmSections.type';

export function FilmSectionsContainer({
  data: initialData = [],
  children,
  autofocus,
}: FilmSectionsContainerProps) {
  const navigation = useNavigation();
  const { isTV, numberOfColumnsTV, numberOfColumnsMobile } = useConfigContext();

  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, [navigation]);

  const hasFilms = useMemo(
    () => initialData.some(({ films }) => films.length > 0),
    [initialData]
  );

  // Flatten `[{ header, films }]` into the mixed header/film list FlashList wants
  // for section lists, plus the positions of the headers within it.
  const { data, stickyHeaderIndices } = useMemo(() => {
    const columns = isTV ? numberOfColumnsTV : numberOfColumnsMobile;
    const thumbnailsRows = isTV ? THUMBNAILS_ROWS_TV : THUMBNAILS_ROWS;

    const sections: FilmSectionsData[] = initialData.length > 0 ? initialData : [{
      header: '',
      films: new Array(columns * thumbnailsRows).fill(null).map((_, index) => ({
        id: `film-section-placeholder-${index}`,
        link: '',
        type: FilmType.FILM,
        poster: '',
        title: '',
        subtitle: '',
      })),
      isPlaceholder: true,
    }];

    const items: FilmSectionsItem[] = [];
    const headerIndices: number[] = [];

    sections.forEach(({ header, films, isPlaceholder = false }, sectionIndex) => {
      // Where the section starts: its header when it has one, otherwise its
      // first row -- what focus/scroll should reveal for that section.
      const sectionStart = items.length;

      if (header && !isPlaceholder) {
        headerIndices.push(sectionStart);
        items.push({
          type: FilmSectionsItemType.HEADER,
          key: `film-section-header-${sectionIndex}`,
          header,
        });
      }

      // each card is a separate item. A header spans the full width (see
      // `overrideItemLayout`), which also breaks the row -- a section always
      // starts on a fresh line even when the previous one ended mid-row.
      films.forEach((film, filmIndex) => {
        const column = filmIndex % columns;
        // Index of the first card of the row this card lands in.
        const rowStart = items.length - column;

        items.push({
          type: FilmSectionsItemType.FILM,
          key: `film-section-${sectionIndex}-film-${filmIndex}-${film.id}`,
          film,
          isPlaceholder,
          // Scroll the header into view together with the section's first row.
          scrollIndex: filmIndex < columns ? sectionStart : rowStart,
        });
      });
    });

    return { data: items, stickyHeaderIndices: headerIndices };
  }, [initialData, isTV, numberOfColumnsTV, numberOfColumnsMobile]);

  const containerProps = {
    data,
    stickyHeaderIndices,
    hasFilms,
    children,
    autofocus,
    handleOnPress,
  };

  return isTV ? <FilmSectionsComponentTV { ...containerProps } /> : <FilmSectionsComponent { ...containerProps } />;

}

export default FilmSectionsContainer;
