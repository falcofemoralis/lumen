import { ACTOR_ROUTE, CATEGORY_ROUTE, FILM_ROUTE } from 'Navigation/routes';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';

type FilmInput = Pick<FilmCardInterface, 'link' | 'poster'>;

export const openFilm = (film: FilmInput, navigation: any) => {
  const { link, poster } = film;

  LoggerStore.debug('openFilm', { link });

  if (!link) {
    NotificationStore.displayError('Oops! Film link is missing.');

    return;
  }

  navigation.push(
    FILM_ROUTE,
    { link, thumbnailPoster: poster } as never
  );
};

export const openActor = (link: string, navigation: any) => {
  LoggerStore.debug('openActor', { link });

  navigation.push(
    ACTOR_ROUTE,
    { link } as never
  );
};

export const openCategory = (link: string, navigation: any) => {
  LoggerStore.debug('openCategory', { link });

  navigation.push(
    CATEGORY_ROUTE,
    { link } as never
  );
};