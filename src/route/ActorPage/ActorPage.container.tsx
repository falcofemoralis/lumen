import { useNavigation } from '@react-navigation/native';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { ActorInterface } from 'Type/Actor.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { openFilm } from 'Util/Router';

import ActorPageComponent from './ActorPage.component';
import ActorPageComponentTV from './ActorPage.component.atv';
import { ActorPageContainerProps } from './ActorPage.type';

export function ActorPageContainer({ route }: ActorPageContainerProps) {
  const { link } = route.params as { link: string };
  const [isLoading, setIsLoading] = useState(true);
  const [actor, setActor] = useState<ActorInterface | null>(null);
  const { currentService } = useServiceContext();
  const navigation = useNavigation();

  const fetchActor = async () => {
    try {
      setIsLoading(true);

      const data = await currentService.getActorDetails(link);

      setActor(data);
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActor();
  }, []);

  const handleSelectFilm = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, []);

  const containerFunctions = {
    handleSelectFilm,
  };

  const containerProps = () => ({
    isLoading,
    actor,
  });

  return withTV(ActorPageComponentTV, ActorPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default ActorPageContainer;
