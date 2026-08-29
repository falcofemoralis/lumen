import { useQuery } from '@tanstack/react-query';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { FILM_TRAILER_SCREEN } from 'Navigation/navigationRoutes';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { hideSystemBars, showSystemBars } from 'Util/Device';
import { navigationRef } from 'Util/Navigation';
import { queryKeys, STALE_TIME } from 'Util/Query';

import FilmTrailerScreenComponent from './FilmTrailerScreen.component';
import FilmTrailerScreenComponentTV from './FilmTrailerScreen.component.atv';
import { FilmTrailerScreenContainerProps } from './FilmTrailerScreen.type';

export const FilmTrailerScreen = () => {
  const { film } = RouterStore.popData(FILM_TRAILER_SCREEN) as {
    film: FilmInterface;
  };

  return (
    <FilmTrailerScreenContainer film={ film } />
  );
};

export const FilmTrailerScreenContainer = ({
  film,
}: FilmTrailerScreenContainerProps) => {
  const { currentService } = useServiceContext();
  const isTV = useIsTV();
  const overlayRef = useRef<ThemedOverlayRef | null>(null);

  const { data: trailerUrl = null, isLoading } = useQuery({
    queryKey: queryKeys.filmTrailer(film.id),
    queryFn: () => currentService.getFilmTrailer(film.id),
    staleTime: STALE_TIME.LONG,
  });

  useEffect(() => {
    hideSystemBars('slide');

    const focusSubscription = AppState.addEventListener('focus', () => {
      hideSystemBars('none');
    });

    return () => {
      showSystemBars('slide');
      focusSubscription.remove();
    };
  }, []);

  const backHandler = () => {
    navigationRef.goBack();
  };

  const containerProps = {
    overlayRef,
    trailerUrl,
    isLoading,
    backHandler,
  };

  return isTV
    ? <FilmTrailerScreenComponentTV { ...containerProps } />
    : <FilmTrailerScreenComponent { ...containerProps } />;
};

export default FilmTrailerScreen;
