import { router } from 'expo-router';
import NotificationStore from 'Store/Notification.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export const openFilm = (film: FilmCardInterface) => {
  const { link, poster } = film;

  if (!link) {
    NotificationStore.displayError('Oops! Film link is missing.');

    return;
  }

  router.push({
    pathname: '/film/[link]',
    params: {
      link,
      poster,
    },
  });
};

export const openActor = (link: string) => {
  router.push({
    pathname: '/actor/[link]',
    params: {
      link,
    },
  });
};

export const openCategory = (link: string) => {
  router.push({
    pathname: '/category/[link]',
    params: {
      link,
    },
  });
};
