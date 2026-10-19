import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { FilmGrid } from 'Component/FilmGrid';
import { FilmList } from 'Component/FilmList';
import { FilmPager } from 'Component/FilmPager';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { SourceLoadError } from 'Component/SourceLoadError';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { Image } from 'expo-image';
import { RetainedScrollContext } from 'Hooks/useRetainedScroll';
import { t } from 'i18n/translate';
import Radio from 'lucide-react-native/icons/radio';
import Tv from 'lucide-react-native/icons/tv';
import { AppStackParamList } from 'Navigation/navigationTypes';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { normalizeNavigationOrder } from 'Util/NavigationOrder';

import { registerUnifiedFilm, sourceRouter } from '../../source';
import { getZonaBroadcasts, ZonaBroadcast } from '../../source/adapters/ZonaBroadcasts';
import { getZonaShows } from '../../source/adapters/ZonaShowsCatalog';
import { ContentSource } from '../../source/types/ContentSource';

function BroadcastLogo({ item, compact = false }: { item: ZonaBroadcast; compact?: boolean }) {
  const { scale, theme } = useAppTheme();
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const image = [item.image, item.imageFallback].find(url => url && !failedUrls.includes(url));

  return (
    <View style={ { width: compact ? scale(40) : '100%', height: compact ? scale(40) : undefined,
      aspectRatio: compact ? 1 : 3, maxHeight: scale(90),
      alignItems: 'center', justifyContent: 'center', marginRight: compact ? scale(10) : 0 } }
    >
      { image ? (
        <Image
          source={ image }
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={ 0 }
          recyclingKey={ image }
          onError={ () => setFailedUrls(previous => [...previous, image!]) }
          style={ { width: '100%', height: '100%' } }
        />
      ) : item.kind === 'radio' ? <Radio size={ scale(40) } color={ theme.colors.icon } />
        : <Tv size={ scale(40) } color={ theme.colors.icon } /> }
    </View>
  );
}

function Shows() {
  const { broadcastDisplayMode } = useConfigContext();
  const menuItems = useMemo(() => [{ id: 'zona-shows', title: t('TV shows'), path: '' }], []);
  const pager = useFilmPager({ queryKey: ['zona-web-shows-v2'], menuItems,
    fetchFilms: async (_item, page) => {
      const result = await getZonaShows(page);
      result.films.forEach(card => {
        const adapter = sourceRouter.getAdapterForLink(card.link);
        if (adapter) registerUnifiedFilm(adapter.normalizeFilmCard(card));
      });

      return result;
    } });
  const item = pager.pagerItems[0];
  if (pager.isError) return <SourceLoadError onRetry={ () => item && void pager.onNextLoad(true, item) } />;
  if (broadcastDisplayMode === 'list') return (
    <FilmList
      items={ (item?.films ?? []).map(film => ({ film })) }
      onNextLoad={ refresh => item ? pager.onNextLoad(refresh, item) : Promise.resolve() }
    />
  );

  return (
    <FilmGrid
      films={ item?.films ?? [] }
      hasMorePages={ !!item && item.pagination.currentPage < item.pagination.totalPages }
      onNextLoad={ refresh => item ? pager.onNextLoad(refresh, item) : Promise.resolve() }
      showScrollToTopButton
    />
  );
}
function BroadcastList({ kind }: { kind: 'tv' | 'radio' }) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { theme, scale } = useAppTheme();
  const { isTV, numberOfColumnsMobile, numberOfColumnsTV } = useConfigContext();
  const { zonaShowAdult, broadcastDisplayMode } = useConfigContext();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['zona-broadcasts', kind],
    queryFn: () => getZonaBroadcasts(kind), staleTime: 5 * 60_000, retry: false });
  if (isPending) return <Loader isLoading />;
  if (isError) return <SourceLoadError onRetry={ () => void refetch() } />;
  const available = (data ?? []).filter(item => zonaShowAdult || !item.adult);
  if (!available.length) return <InfoBlock title={ t('No data') } subtitle="" />;
  const play = (broadcast: ZonaBroadcast) => navigation.navigate('BroadcastPlayer', { broadcast });
  if (broadcastDisplayMode === 'grid') return (
    <ThemedGrid
      autofocus
      data={ available }
      numberOfColumns={ isTV ? numberOfColumnsTV : numberOfColumnsMobile }
      renderItem={ ({ item }: { item: ZonaBroadcast }) => (
        <View style={ { padding: scale(4), width: '100%' } }>
          <ThemedPressable
            onPress={ () => play(item) }
            style={ ({ isFocused }) => ({ width: '100%', aspectRatio: 1.25, borderWidth: scale(2),
              borderColor: isFocused ? theme.colors.primary : 'transparent', borderRadius: scale(8),
              backgroundColor: theme.colors.button }) }
            contentStyle={ { flex: 1, width: '100%' } }
          >
            <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: scale(8) } }
            >
              <BroadcastLogo key={ item.id } item={ item } />
              <ThemedText numberOfLines={ 2 } style={ { textAlign: 'center', marginTop: scale(6) } }>
                { item.title }
              </ThemedText>
            </View>
          </ThemedPressable>
        </View>
      ) }
    />
  );

  return (
    <ThemedGrid
      autofocus
      data={ available }
      numberOfColumns={ 1 }
      renderItem={ ({ item }: { item: ZonaBroadcast }) => (
        <ThemedButton
          title={ item.title }
          onPress={ () => play(item) }
          IconComponent={ () => <BroadcastLogo key={ item.id } item={ item } compact /> }
          style={ { margin: scale(4), height: scale(64) } }
          contentStyle={ { flex: 1, alignItems: 'center', justifyContent: 'flex-start' } }
          textStyle={ { flex: 1 } }
        />
      ) }
    />
  );
}
export default function BroadcastScreen() {
  const focused = useIsFocused();
  const { broadcastTabOrder, hiddenBroadcastTabs, tabPosition, enabledSources } = useConfigContext();
  const ids = normalizeNavigationOrder(broadcastTabOrder, ['shows', 'radio', 'tv'], ['shows', 'radio', 'tv'])
    .filter(id => !hiddenBroadcastTabs.includes(id));
  const visible = ids.length ? ids : ['shows'];
  const titles = { shows: t('TV shows'), radio: t('Radio'), tv: t('TV channels') };
  const items: PagerItemInterface[] = visible.map(id => ({
    menuItem: { id, title: titles[id as keyof typeof titles], path: '' },
    films: [], pagination: { currentPage: 1, totalPages: 1 } }));
  if (!enabledSources.includes(ContentSource.ZONA)) {
    return <Page><InfoBlock title={ t('Zona is disabled') } subtitle="" /></Page>;
  }

  return (
    <Page>
      <FilmPager
        pagerItems={ items }
        tabPosition={ tabPosition }
        onPreLoad={ () => {} }
        onNextLoad={ async () => {} }
        renderPageContent={ (item, _index, active) => (
          <RetainedScrollContext.Provider value={ focused && active }>
            { item.menuItem.id === 'shows' ? <Shows /> : <BroadcastList kind={ item.menuItem.id as 'tv' | 'radio' } /> }
          </RetainedScrollContext.Provider>
        ) }
      />
    </Page>
  );
}
