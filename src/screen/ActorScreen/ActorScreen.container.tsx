import { useQuery } from '@tanstack/react-query';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { queryKeys } from 'Util/Query';

import ActorScreenComponent from './ActorScreen.component';
import ActorScreenComponentTV from './ActorScreen.component.atv';
import { ActorScreenContainerProps } from './ActorScreen.type';

export function ActorScreenContainer({ route }: ActorScreenContainerProps) {
  const { link } = route.params as { link: string };
  const isTV = useIsTV();
  const { currentService } = useServiceContext();

  const { data: actor = null, isLoading } = useQuery({
    queryKey: queryKeys.actor(link),
    queryFn: () => currentService.getActorDetails(link),
    enabled: !!link,
  });

  const containerProps = {
    isLoading,
    actor,
  };

  return isTV ? <ActorScreenComponentTV { ...containerProps } /> : <ActorScreenComponent { ...containerProps } />;
}

export default ActorScreenContainer;
