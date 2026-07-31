import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useCallback } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { queryKeys } from 'Util/Query';
import { openFilm } from 'Util/Router';

import ActorScreenComponent from './ActorScreen.component';
import ActorScreenComponentTV from './ActorScreen.component.atv';
import { ActorScreenContainerProps } from './ActorScreen.type';

export function ActorScreenContainer({ route }: ActorScreenContainerProps) {
  const { link } = route.params as { link: string };
  const { isTV } = useConfigContext();
  const { currentService } = useServiceContext();
  const navigation = useNavigation();

  const { data: actor = null, isLoading } = useQuery({
    queryKey: queryKeys.actor(link),
    queryFn: () => currentService.getActorDetails(link),
    enabled: !!link,
  });

  const handleSelectFilm = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, [navigation]);

  const containerProps = {
    isLoading,
    actor,
    handleSelectFilm,
  };

  return isTV ? <ActorScreenComponentTV { ...containerProps } /> : <ActorScreenComponent { ...containerProps } />;
}

export default ActorScreenContainer;
