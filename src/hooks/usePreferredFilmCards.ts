import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useIsFocused, useRoute } from '@react-navigation/native';
import { storage } from 'Util/Storage';
import { enqueueBookmarkRequest } from '../source/search/BookmarkRequests';
import { publishExistingCardCaches } from 'Util/CloudSync/cardCache';
import { cardCacheRevision, subscribeCardCache } from '../source/search/CardCacheSync';
import { BookmarkMetadataCache } from '../source/search/BookmarkMetadataCache';
import { useSyncExternalStore, useCallback, useMemo, useRef } from 'react';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useNetworkContext } from 'Context/NetworkContext';
import { useConfigContext } from 'Context/ConfigContext';
import { sourceForLink } from '../source/types/SourceSelection';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { sourceRouter } from '../source';
import { HomeCardCache } from '../source/search/HomeCardCache';
import { ZonaCardTypeCache } from '../source/search/ZonaCardTypeCache';
import { preferredCardForDisplay, preferredCardsSignature, preferredCardsSnapshot, shouldRefreshZonaSeries, cardsAcrossFolders } from '../source/search/PreferredFilmCards';

publishExistingCardCaches();
let bookmarkCache: BookmarkMetadataCache | undefined;
const getBookmarkCache = () => bookmarkCache ??= new BookmarkMetadataCache(
  storage.getMiscStorage(), async card => {
    const primary = await sourceRouter.resolveBookmarkPrimary(card);
    if (primary) return primary;
    return enqueueBookmarkRequest('bookmark-metadata:' + card.link, () => sourceRouter.resolvePreferredCard(card, true));
  },
);

let homeCache: HomeCardCache | undefined;
export const getHomeCardCache = () => homeCache ??= new HomeCardCache(storage.getMiscStorage());
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
  }).catch(error => { cache.delete(card.link); throw error; });
  cache.set(card.link, { time: Date.now(), value });
  while (cache.size > 512) cache.delete(cache.keys().next().value!);
  return value;
};

export const usePreferredFilmCards = (items: PagerItemInterface[], persistWeekly = false, persistHome = false): PagerItemInterface[] => {
  const cacheRevision = useSyncExternalStore(subscribeCardCache, cardCacheRevision);
  const { isInternetAvailable } = useNetworkContext();
  const { enabledSources } = useConfigContext();
  const isFocused = useIsFocused();
  const route = useRoute();
  const seriesCheckedRef = useRef(new Map<string, number>());
  const networkRef = useRef(isInternetAvailable);
  networkRef.current = isInternetAvailable;
  const focusedRef = useRef(isFocused);
  focusedRef.current = isFocused;
  const cards = useMemo(() => cardsAcrossFolders(items), [items]);
  const queryClient = useQueryClient();
  const signature = preferredCardsSignature(cards);
  const knownCardsRef = useRef(new Map<string, FilmCardInterface>());
  const previousRevision = useRef(cacheRevision);
  if (previousRevision.current !== cacheRevision) { knownCardsRef.current.clear(); seriesCheckedRef.current.clear(); previousRevision.current = cacheRevision; }
  const displayedCardsRef = useRef(new Map<string, { original: FilmCardInterface; enriched: FilmCardInterface; weekly: boolean; displayed: FilmCardInterface }>());
  const queryKey = useMemo(() => ['preferred-film-cards', route.key, persistWeekly, signature, persistHome, cacheRevision, enabledSources.join(',')], [route.key, signature, persistWeekly, persistHome, cacheRevision, enabledSources]);
  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;
  const snapshot = () => preferredCardsSnapshot(cards, knownCardsRef.current,
    persistWeekly ? (card) => getBookmarkCache().peek(card) : (card) => persistHome ? getTypeCache().peek(getHomeCardCache().peek(card)) : getTypeCache().peek(card));
  const { data: preferred } = useQuery({
    queryKey,
    initialData: snapshot,
    initialDataUpdatedAt: 0,
    enabled: isFocused && isInternetAvailable && cards.length > 0,
    queryFn: async ({ signal }) => {
      const resolved = snapshot();
      // Cached folders can contain thousands of cards. Publish once per batch,
      // and yield the JS thread so taps and swipes can run during refresh.
      let lastPublished = Date.now();
      let dirty = false;
      const publish = async (force = false) => {
        if (signal.aborted) return;
        dirty = true;
        if (!force && Date.now() - lastPublished < 150) return;
        const activeKey = queryKeyRef.current;
        queryClient.setQueryData<Map<string, FilmCardInterface>>(activeKey, previous =>
          new Map([...(previous ?? []), ...knownCardsRef.current]));
        lastPublished = Date.now();
        dirty = false;
        await new Promise<void>(resolve => setTimeout(resolve, 0));
      };
      const pending = cards.filter((card) => resolved.get(card.link)?.contentTypePending);
      const remaining = cards.filter((card) => !resolved.get(card.link)?.contentTypePending);
      const prioritized = [...pending, ...remaining];
      const statusLanes = [Promise.resolve(), Promise.resolve()];
      let nextStatus = 0;
      const scheduleStatus = (job: () => Promise<void>) => {
        const index = nextStatus++ % statusLanes.length;
        statusLanes[index] = statusLanes[index].then(async () => {
          if (!signal.aborted && networkRef.current && focusedRef.current) await job();
        });
      };
      const lanes = [{ cards: prioritized, workers: 4 }];
      await Promise.all(lanes.map(async lane => {
        let next = 0;
        await Promise.all(Array.from({ length: Math.min(lane.workers, lane.cards.length) }, async () => {
          while (!signal.aborted && next < lane.cards.length && networkRef.current && (persistWeekly || focusedRef.current)) {
          const original = lane.cards[next++];
          const card = persistWeekly ? original : resolved.get(original.link)!;
          let updated = await (persistWeekly ? getBookmarkCache().resolve(card)
            : persistHome && getHomeCardCache().isFresh(original) ? Promise.resolve(card) : persistHome ? resolveCard(card).catch(() => card) : (card.ratingSourceType === 'ANIXART' || (isZonaCard(card) && !card.contentTypePending && !card.ratings?.imdbPending)) ? Promise.resolve(card) : resolveCard(card));
            if (signal.aborted) break;
          const previousCard = knownCardsRef.current.get(original.link);
          // A partial refresh must not erase already verified episode information.
          if (!updated.info && previousCard?.info && previousCard.link === updated.link) {
            updated = { ...updated, info: previousCard.info };
          }
          if (!persistWeekly) getTypeCache().remember(updated);
          if (persistHome && updated !== card && !getHomeCardCache().isFresh(original) && !isZonaCard(updated)) getHomeCardCache().remember(original, updated);
          if (persistHome && updated !== card && isZonaCard(updated) && !updated.link.includes('/tvseries/')) getHomeCardCache().remember(original, updated);
          knownCardsRef.current.set(original.link, updated);
          resolved.set(original.link, updated);
          await publish();
          // Publish the poster first; this card's episodes must not wait for the whole catalog.
          if (!persistWeekly && !(persistHome && getHomeCardCache().isFresh(original)) && focusedRef.current && shouldRefreshZonaSeries(updated, seriesCheckedRef.current.get(updated.link))) {
            // Also throttle failed requests, so focus/pagination cannot create a retry storm.
            seriesCheckedRef.current.set(updated.link, Date.now());
            scheduleStatus(async () => {
            try {
              const detailed = await sourceRouter.resolvePreferredCard(updated, true);
                  if (signal.aborted) return;
              knownCardsRef.current.set(original.link, detailed);
              resolved.set(original.link, detailed);
              if (persistHome) getHomeCardCache().remember(original, detailed);
              cache.set(updated.link, { time: Date.now(), value: Promise.resolve(detailed) });
              await publish();
            } catch { /* Keep the visible card; retry on a later refresh. */ }
            });
          }
        }
        }));
      }));
      // Episode enrichment cannot block classification of the following rows.
      if (dirty) await publish(true);
      await Promise.all(statusLanes);
      if (dirty) await publish(true);
      return new Map([...resolved, ...knownCardsRef.current]);
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