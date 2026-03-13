import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useNavigationContext } from 'Context/NavigationContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as NavigationBar from 'expo-navigation-bar';
import * as StatusBar from 'expo-status-bar';
import { FILM_TRAILER_SCREEN } from 'Navigation/navigationRoutes';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { navigationRef } from 'Util/Navigation';

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
  const [isLoading, setIsLoading] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const { currentService } = useServiceContext();
  const { isTV } = useConfigContext();
  const overlayRef = useRef<ThemedOverlayRef | null>(null);
  const loadingRef = useRef(false);
  const { lockNavigation, unlockNavigation } = useNavigationContext();

  useEffect(() => {
    loadTrailer();

    if (isTV) {
      lockNavigation();
    }

    return () => {
      if (isTV) {
        unlockNavigation();
      }
    };
  }, []);

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

  const loadTrailer = async () => {
    const { id } = film;

    if (loadingRef.current || trailerUrl) {
      return;
    }

    loadingRef.current = true;

    try {
      setIsLoading(true);

      const url = await currentService.getFilmTrailer(id);

      setTrailerUrl(url);
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const backHandler = () => {
    navigationRef.goBack();
  };

  const containerProps = {
    overlayRef,
    trailerUrl,
    isLoading,
    backHandler,
  };

  // eslint-disable-next-line max-len
  return isTV ? <FilmTrailerScreenComponentTV { ...containerProps } /> : <FilmTrailerScreenComponent { ...containerProps } />;
};

export default FilmTrailerScreen;
