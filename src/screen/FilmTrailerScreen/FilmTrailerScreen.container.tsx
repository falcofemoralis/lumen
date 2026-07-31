import { useQuery } from '@tanstack/react-query';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as NavigationBar from 'expo-navigation-bar';
import * as StatusBar from 'expo-status-bar';
import { FILM_TRAILER_SCREEN } from 'Navigation/navigationRoutes';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
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
  const { isTV } = useConfigContext();
  const overlayRef = useRef<ThemedOverlayRef | null>(null);

  const { data: trailerUrl = null, isLoading } = useQuery({
    queryKey: queryKeys.filmTrailer(film.id),
    queryFn: () => currentService.getFilmTrailer(film.id),
    staleTime: STALE_TIME.LONG,
  });

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    StatusBar.setStatusBarHidden(true, 'slide');

    const focusSubscription = AppState.addEventListener('focus', () => {
      NavigationBar.setVisibilityAsync('hidden');
      StatusBar.setStatusBarHidden(true, 'none');
    });

    return () => {
      NavigationBar.setVisibilityAsync('visible');
      StatusBar.setStatusBarHidden(false, 'slide');
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
