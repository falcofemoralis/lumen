import { router } from 'expo-router';

export const openFilm = (link: string) => {
  router.push({
    pathname: '/film/[link]',
    params: {
      link,
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
