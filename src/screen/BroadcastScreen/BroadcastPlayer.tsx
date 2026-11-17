import { useQuery } from '@tanstack/react-query';
import { Header } from 'Component/Header';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { Player } from 'Component/Player';
import { SourceLoadError } from 'Component/SourceLoadError';
import { useMemo } from 'react';

import { resolveZonaBroadcastVideo, ZonaBroadcast, zonaBroadcastSession } from '../../source/adapters/ZonaBroadcasts';

export default function BroadcastPlayer({ route }: { route: { params: { broadcast: ZonaBroadcast } } }) {
  const { broadcast } = route.params;
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['zona-broadcast-video', broadcast.kind, broadcast.id, broadcast.streams.map(stream => stream.url)],
    queryFn: () => resolveZonaBroadcastVideo(broadcast), staleTime: 60_000, retry: false,
  });
  const session = useMemo(() => data ? zonaBroadcastSession(broadcast, data) : null, [broadcast, data]);

  return (
    <Page fullscreen checkConnection={ false }>
      { session ? <Player { ...session } isLive quality={ session.video.streams[0].quality } /> : (
        <>
          <Header title={ broadcast.title } />
          { isPending ? <Loader isLoading /> : isError && <SourceLoadError onRetry={ () => void refetch() } /> }
        </>
      ) }
    </Page>
  );
}