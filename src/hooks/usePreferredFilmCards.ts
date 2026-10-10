import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useIsFocused, useRoute } from '@react-navigation/native';
import { storage } from 'Util/Storage';
import { enqueueRatingRequest } from 'Util/RatingRequestQueue';
import { BookmarkMetadataCache } from '../source/search/BookmarkMetadataCache';
import { useCallback, useMemo, useRef } from 'react';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useNetworkContext } from 'Context/NetworkContext';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { sourceRouter } from '../source';
import { ZonaCardTypeCache } from '../source/search/ZonaCardTypeCache';
import { preferredCardForDisplay, preferredCardsSignature, preferredCardsSnapshot } from '../source/search/PreferredFilmCards';

let bookmarkCache: BookmarkMetadataCache | undefined;
const getBookmarkCache = () => bookmarkCache ??= new BookmarkMetadataCache(
  storage.getMiscStorage(), (card) => enqueueRatingRequest('bookmark-metadata:' + card.link, () => sourceRouter.resolvePreferredCard(card, true)),
);

let typeCache: ZonaCardTypeCache | undefined;
const getTypeCache = () => typeCache ??= new ZonaCardTypeCache(storage.getMiscStorage());
const isZonaCard = (card: FilmCardInterface) => /^https?:\/\/[^/]*\.zona\.im\//.test(card.link);
const cache = new Map<string, { time: number; value: Promise<FilmCardInterface> }>();
const resolveCard = (card: FilmCardInterface) => {
  const existing = cache.get(card.link);
  if (existing && Date.now() - existing.time < 5 * 60 * 1000) return existing.value;
  const value = sourceRouter.resolvePreferredCard(card, false, { deferSeriesInfo: true }).then((resolved) => {
    if (resolved === card || resolved.contentTypePending) cache.delete(card.link);
    return resolved;
  });
  cache.set(card.link, { time: Date.now(), value });
  return value;
};

export const usePreferredFilmCards = (items: PagerItemInterface[], persistWeekly = false): PagerItemInterface[] => {
  const { isInternetAvailable } = useNetworkContext();
  const isFocused = useIsFocused();
  const route = useRoute();
  const focusedRef = useRef(isFocused);
  focusedRef.current = isFocused;
  const cards = useMemo(() => items.flatMap((item) => item.films ?? []), [items]);
  const queryClient = useQueryClient();
  const signature = preferredCardsSignature(cards);
  const knownCardsRef = useRef(new Map<string, FilmCardInterface>());
  const displayedCardsRef = useRef(new Map<string, { original: FilmCardInterface; enriched: FilmCardInterface; weekly: boolean; displayed: FilmCardInterface }>());
  const queryKey = useMemo(() => ['preferred-film-cards', route.key, persistWeekly, signature], [route.key, signature, persistWeekly]);
  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;
  const snapshot = () => preferredCardsSnapshot(cards, knownCardsRef.current,
    persistWeekly ? (card) => getBookmarkCache().peek(card) : (card) => getTypeCache().peek(card));
  const { data: preferred } = useQuery({
    queryKey,
    initialData: snapshot,
    initialDataUpdatedAt: 0,
    enabled: isFocused && isInternetAvailable && cards.length > 0,
    queryFn: async () => {
      const resolved = snapshot();
      const pending = cards.filter((card) => resolved.get(card.link)?.contentTypePending);
      const remaining = cards.filter((card) => !resolved.get(card.link)?.contentTypePending);
      const prioritized = [...pending, ...remaining];
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(persistWeekly ? 1 : 4, cards.length) }, async () => {
        while (next < cards.length && focusedRef.current) {
          const original = prioritized[next++];
          const card = persistWeekly ? original : resolved.get(original.link)!;
          const updated = await (persistWeekly ? getBookmarkCache().resolve(card)
            : isZonaCard(card) && !card.contentTypePending && !card.ratings?.imdbPending ? Promise.resolve(card) : resolveCard(card));
          if (!persistWeekly) getTypeCache().remember(updated);
          knownCardsRef.current.set(original.link, updated);
          resolved.set(original.link, updated);
          queryClient.setQueryData(queryKey, new Map(resolved));
        }
      }));
      // Season/episode requests run after classification, so they cannot hold posters back.
      if (!persistWeekly) {
        const series = [...resolved.entries()].filter(([, card]) => isZonaCard(card) && card.link.includes('/tvseries/') && !card.contentTypePending && !card.info);
        let index = 0;
        await Promise.all(Array.from({ length: Math.min(4, series.length) }, async () => {
          while (index < series.length && focusedRef.current) {
            const [originalLink, card] = series[index++];
            const updated = await sourceRouter.resolvePreferredCard(card);
            knownCardsRef.current.set(originalLink, updated);
            resolved.set(originalLink, updated);
            cache.set(card.link, { time: Date.now(), value: Promise.resolve(updated) });
            queryClient.setQueryData(queryKey, new Map(resolved));
          }
        }));
      }
      return resolved;
    },
    staleTime: persistWeekly ? 0 : 5 * 60 * 1000,
  });
  useFocusEffect(useCallback(() => {
    if (isInternetAvailable) void queryClient.invalidateQueries({ queryKey: queryKeyRef.current }, { cancelRefetch: false });
  }, [isInternetAvailable, queryClient]));
  return useMemo(() => items.map((item) => {
    const seen = new Set<string>();
    return {
      ...item,
      films: item.films?.map((card) => {
        const enriched = preferred?.get(card.link) ?? card;
        const cached = displayedCardsRef.current.get(card.link);
        if (cached?.original === card && cached.enriched === enriched && cached.weekly === persistWeekly) return cached.displayed;
        const displayed = preferredCardForDisplay(card, enriched, persistWeekly);
        displayedCardsRef.current.set(card.link, { original: card, enriched, weekly: persistWeekly, displayed });
        return displayed;
      })
        .filter((card) => {
          if (seen.has(card.link)) return false;
          seen.add(card.link);
          return true;
        }) ?? null,
    };
  }), [items, preferred, persistWeekly]);
};