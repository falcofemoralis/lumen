import { Image } from 'expo-image';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { FilmGridItem, FilmGridItemType } from 'Component/FilmGrid/FilmGrid.type';
import { createPosterPrefetchQueue } from 'Util/Film/PosterPrefetch';

const prefetch = createPosterPrefetchQueue(url => Image.prefetch(url, { cachePolicy: 'disk' }));

export function usePosterPrefetch(data: FilmGridItem[], columns: number) {
  const latest = useRef({ data, columns });
  const lastVisibleRef = useRef(-1);
  latest.current = { data, columns };
  const ahead = useCallback((lastVisible = lastVisibleRef.current) => {
    lastVisibleRef.current = lastVisible;
    if (Platform.OS !== 'android') return;
    const { data, columns } = latest.current;
    const posters = data.slice(lastVisible + 1, lastVisible + 1 + columns * 3)
      .flatMap(item => item.type === FilmGridItemType.FILM && !item.isPlaceholder ? [item.film.poster] : []);
    prefetch(posters);
  }, []);
  useEffect(() => { ahead(); }, [data, columns, ahead]);
  return ahead;
}