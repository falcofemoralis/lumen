import { useNavigation } from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { ActorInterface } from 'Type/Actor.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { openFilm } from 'Util/Router';

import ActorScreenComponent from './ActorScreen.component';
import ActorScreenComponentTV from './ActorScreen.component.atv';
import { ActorScreenContainerProps } from './ActorScreen.type';

export function ActorScreenContainer({ route }: ActorScreenContainerProps) {
  const { link } = route.params as { link: string };
  const { isTV } = useConfigContext();
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

  const containerProps = {
    isLoading,
    actor,
    handleSelectFilm,
  };

  return isTV ? <ActorScreenComponentTV { ...containerProps } /> : <ActorScreenComponent { ...containerProps } />;
}

export default ActorScreenContainer;
