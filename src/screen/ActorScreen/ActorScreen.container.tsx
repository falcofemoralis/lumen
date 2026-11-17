import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import NotificationStore from 'Store/Notification.store';
import type { ActorInterface } from 'Type/Actor.interface';
import type { ActorCardInterface } from 'Type/ActorCard.interface';
import { queryKeys } from 'Util/Query';

import { sourceRouter } from '../../source';
import ActorScreenComponent from './ActorScreen.component';
import ActorScreenComponentTV from './ActorScreen.component.atv';
import { ActorScreenContainerProps } from './ActorScreen.type';

export function ActorScreenContainer({ route }: ActorScreenContainerProps) {
  const { link, person } = route.params as { link: string; person?: ActorCardInterface };
  const isTV = useIsTV();
  const { currentService } = useServiceContext();

  const queryClient = useQueryClient();
  const actorKey = queryKeys.actor(link);
  const { data: actor = null, isLoading, isError, refetch } = useQuery({
    queryKey: actorKey,
    queryFn: async () => {
      const result = await sourceRouter.getActorDetails(link, url => currentService.getActorDetails(url), person);
      if (!result) throw new Error('Person page is unavailable');

      return result;
    },
    enabled: !!link,
  });

  const onNextLoad = async (isRefresh: boolean) => {
    if (isRefresh) { await refetch();

      return; }
    const page = actor?.filmographyPage;
    const adapter = sourceRouter.getAdapterForLink(link);
    if (!page || page.currentPage >= page.totalPages || !adapter?.getFilms) return;
    const next = page.currentPage + 1;
    const result = await queryClient.fetchQuery({ queryKey: [...actorKey, 'page', next],
      queryFn: () => adapter.getFilms!(link, next) }).catch(error => {
      NotificationStore.displayError(error);

      return null;
    });
    if (!result) return;
    queryClient.setQueryData<ActorInterface | null>(actorKey, previous => {
      if (!previous?.filmographyPage || previous.filmographyPage.currentPage >= next) return previous;
      const seen = new Set(previous.roles[0]?.films.map(film => film.link));

      return { ...previous,
        roles: previous.roles.map((role, index) => index ? role : { ...role,
          films: [...role.films, ...result.films.filter(film => !seen.has(film.link))] }),
        filmographyPage: { currentPage: next, totalPages: result.totalPages } };
    });
  };
  const containerProps = {
    onNextLoad,
    isLoadError: isError,
    retryLoad: () => { void refetch(); },
    isLoading,
    actor,
  };

  return isTV ? <ActorScreenComponentTV { ...containerProps } /> : <ActorScreenComponent { ...containerProps } />;
}

export default ActorScreenContainer;
