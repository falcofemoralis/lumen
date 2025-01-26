import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmType } from 'Type/FilmType.type';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';
import { HTMLElementInterface } from 'Util/Parser';

import { decodeUrl } from './decode';

export interface JSONResult {
  success: boolean;
  message: string;
}

export const parseFilmType = (type = '') => {
  if (type.includes('films')) {
    return FilmType.Film;
  } if (type.includes('series')) {
    return FilmType.Series;
  } if (type.includes('cartoons')) {
    return FilmType.Multfilm;
  } if (type.includes('animation')) {
    return FilmType.Anime;
  } if (type.includes('show')) {
    return FilmType.TVShow;
  }

  return FilmType.Film;
};

export const parseFilmCard = (el: HTMLElementInterface): FilmCardInterface | null => {
  const id = el.attributes['data-id'];
  const link = el.querySelector('.b-content__inline_item-link a')?.attributes.href ?? '';
  const type = parseFilmType(el.querySelector('.cat')?.attributes.class);
  const poster = el.querySelector('.b-content__inline_item-cover img')?.attributes.src ?? '';
  const title = el.querySelector('.b-content__inline_item-link a')?.rawText ?? '';
  const subtitle = el.querySelector('.b-content__inline_item-link div')?.rawText ?? '';
  const info = (el.querySelector('.b-content__inline_item-cover .info')?.rawText ?? '').replaceAll(
    '<br/>',
    ', ',
  );

  return {
    id,
    link,
    type,
    poster,
    title,
    subtitle,
    info,
  };
};

export const parseStreams = (streams: string | null): FilmStreamInterface[] => {
  const parsedStreams: FilmStreamInterface[] = [];

  if (streams && streams.length > 0) {
    const decodedStreams = decodeUrl(streams) as string;
    const split = decodedStreams.split(',');

    split.forEach((str) => {
      if (str.includes(' or ')) {
        const m = str.substring(str.indexOf(']') + 1);
        parsedStreams.push({
          url: m.split(' or ')[0],
          quality: str.substring(1, str.indexOf(']')),
        });
      } else {
        parsedStreams.push({
          url: str.substring(str.indexOf(']') + 1),
          quality: str.substring(1, str.indexOf(']')),
        });
      }
    });
  }

  return parsedStreams;
};

export const parseSeasons = (root: HTMLElementInterface): {
  seasons: SeasonInterface[];
  lastSeasonId: string | undefined;
  lastEpisodeId: string | undefined;
} => {
  const seasons: SeasonInterface[] = [];
  const lastWatch: {
    lastSeasonId: string | undefined;
    lastEpisodeId: string | undefined;
  } = {
    lastSeasonId: undefined,
    lastEpisodeId: undefined,
  };

  root.querySelectorAll('li.b-simple_season__item').forEach((el) => {
    const seasonId = el.attributes['data-tab_id'];
    const episodes: EpisodeInterface[] = [];

    root.querySelectorAll(`#simple-episodes-list-${seasonId}`).forEach((list) => {
      list.querySelectorAll('.b-simple_episode__item').forEach((ep) => {
        if (ep.classList.contains('active')) {
          lastWatch.lastSeasonId = ep.attributes['data-season_id'];
          lastWatch.lastEpisodeId = ep.attributes['data-episode_id'];
        }

        episodes.push({
          name: ep.rawText,
          episodeId: ep.attributes['data-episode_id'],
        });
      });
    });

    const season: SeasonInterface = {
      name: el.rawText,
      seasonId: el.attributes['data-tab_id'],
      episodes,
    };

    seasons.push(season);
  });

  return {
    seasons,
    ...lastWatch,
  };
};

export const parseFilmsListRoot = (root: HTMLElementInterface): FilmListInterface => {
  const films: FilmCardInterface[] = [];
  const filmElements = root.querySelectorAll('.b-content__inline_item');

  filmElements.forEach((el) => {
    const film = parseFilmCard(el);

    if (film) {
      films.push(film);
    }
  });

  const navs = root.querySelectorAll('.b-navigation a');

  let totalPages = 1;
  navs.forEach((el, idx) => {
    if (idx === navs.length - 2) {
      totalPages = Number(el.rawText);
    }
  });

  return {
    films,
    totalPages,
  };
};
