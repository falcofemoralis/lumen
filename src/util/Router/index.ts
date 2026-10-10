import { ACTOR_SCREEN, CATEGORY_SCREEN, FILM_SCREEN } from 'Navigation/navigationRoutes';
import NotificationStore from 'Store/Notification.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { getRegisteredUnifiedFilm, sourceResolver } from '../../source';

type FilmInput = Pick<FilmCardInterface, 'link' | 'poster'> & Partial<Pick<FilmCardInterface, 'id'>>;

export const openFilm = (film: FilmInput, navigation: any) => {
  const { link, poster } = film;

  if (!link) {
    NotificationStore.displayError('Oops! Film link is missing.');

    return;
  }

  const unifiedFilm = getRegisteredUnifiedFilm(link);
  const preferredSource = unifiedFilm ? sourceResolver.getPreferredSource(unifiedFilm) : null;
  const preferredLink = unifiedFilm?.sources.find((source) => source.source === preferredSource)?.link ?? link;

  navigation.push(
    FILM_SCREEN,
    {
      link: preferredLink,
      libraryFilmId: film.id,
      thumbnailPoster: poster,
      unifiedFilm,
    } as never
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
