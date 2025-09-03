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

export function ActorPageContainer({ link }: ActorPageContainerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [actor, setActor] = useState<ActorInterface | null>(null);
  const { currentService } = useServiceContext();

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
    openFilm(film);
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
