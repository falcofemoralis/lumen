import { ACTOR_SCREEN, CATEGORY_SCREEN, FILM_SCREEN } from 'Navigation/navigationRoutes';
import NotificationStore from 'Store/Notification.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';

type FilmInput = Pick<FilmCardInterface, 'link' | 'poster'>;

export const openFilm = (film: FilmInput, navigation: any) => {
  const { link, poster } = film;

  if (!link) {
    NotificationStore.displayError('Oops! Film link is missing.');

    return;
  }

  navigation.push(
    FILM_SCREEN,
    { link, thumbnailPoster: poster } as never
  );
};

export const openActor = (link: string, navigation: any) => {
  navigation.push(
    ACTOR_SCREEN,
    { link } as never
  );
};

export const openCategory = (link: string, navigation: any) => {
  navigation.push(
    CATEGORY_SCREEN,
    { link } as never
  );
};