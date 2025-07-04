import moment from 'moment';
import { ActorCardInterface } from 'Type/ActorCard.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmType } from 'Type/FilmType.type';
import { SubtitleInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';
import { HTMLElementInterface } from 'Util/Parser';

import { decodeUrl } from './decode';
import { SubtitleLns } from './playerApi';

export interface JSONResult {
  success: boolean;
  message: string;
}

export const getStaticUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `https://statichdrezka.ac${path}`;
  }

  return `https://statichdrezka.ac/${path}`;
};

export const parseFilmType = (type = '') => {
  if (type.includes('films')) {
    return FilmType.FILM;
  } if (type.includes('series')) {
    return FilmType.SERIES;
  } if (type.includes('cartoons')) {
    return FilmType.CARTOON;
  } if (type.includes('animation')) {
    return FilmType.ANIME;
  } if (type.includes('show')) {
    return FilmType.TV_SHOW;
  }

  return FilmType.FILM;
};

export const parseFilmCard = (el: HTMLElementInterface): FilmCardInterface => {
  const id = el.attributes['data-id'];
  const link = el.querySelector('.b-content__inline_item-link a')?.attributes.href ?? '';
  const type = parseFilmType(el.querySelector('.cat')?.attributes.class);
  const poster = el.querySelector('.b-content__inline_item-cover img')?.attributes.src ?? '';
  const title = el.querySelector('.b-content__inline_item-link a')?.rawText ?? '';
  const subtitle = el.querySelector('.b-content__inline_item-link div')?.rawText ?? '';
  const info = (el.querySelector('.b-content__inline_item-cover .info')?.rawText ?? '').replaceAll(
    '<br/>',
    ', '
  );
  const isPendingRelease = el.querySelector('.b-content__inline_item-cover')?.attributes.class?.includes('wait');

  return {
    id,
    link,
    type,
    poster,
    title,
    subtitle,
    info,
    isPendingRelease,
  };
};

export const parseStreams = (streams: string | null): FilmStreamInterface[] => {
  const parsedStreams = new Map<string, FilmStreamInterface>();

  if (streams && streams.length > 0) {
    const decodedStreams = decodeUrl(streams) as string;
    const split = decodedStreams.split(',');

    split.forEach((str) => {
      let s = null;

      if (str.includes(' or ')) {
        const m = str.substring(str.indexOf(']') + 1);
        s = {
          url: m.split(' or ')[0],
          quality: str.substring(1, str.indexOf(']')),
        };
      } else {
        s = {
          url: str.substring(str.indexOf(']') + 1),
          quality: str.substring(1, str.indexOf(']')),
        };
      }

      if (!parsedStreams.has(s.url)) {
        parsedStreams.set(s.url, s);
      }
    });
  }

  return Array.from(parsedStreams.values());
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

  root.querySelectorAll('.b-simple_season__item').forEach((el) => {
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

export const parseSubtitles = (
  subtitle: string | undefined,
  subtitleDef: string,
  subtitleLns: SubtitleLns
): SubtitleInterface[] => {
  if (!subtitle) {
    return [];
  }

  const rawSubtitles: SubtitleInterface[] = [];
  const subtitles: SubtitleInterface[] = [];

  const subtitleEntries = subtitle.split(',');
  subtitleEntries.forEach((str) => {
    const language = str.substring(1, str.indexOf(']'));
    const url = str.substring(str.indexOf(']') + 1);

    rawSubtitles.push({
      name: language,
      languageCode: '',
      url,
      isDefault: false,
    });
  });

  Object.entries(subtitleLns).forEach(([name, languageCode]) => {
    const rawSubtitle = rawSubtitles.find((s) => s.name === name);

    subtitles.push({
      name: rawSubtitle?.name ?? name,
      languageCode,
      url: rawSubtitle?.url ?? '',
      isDefault: languageCode === subtitleDef,
    });
  });

  return subtitles;
};

export const parseActorCard = (
  node: HTMLElementInterface,
  isDirector?: boolean
): ActorCardInterface => {
  const name = node.querySelector('span')?.rawText ?? '';
  const photo = node.attributes['data-photo'];
  const link = node.querySelector('a')?.attributes.href;
  const job = node.attributes['data-job'];

  return {
    name,
    photo: photo === 'null' ? getStaticUrl('/i/nopersonphoto.png') : photo,
    link,
    job,
    isDirector,
  };
};

export const formatDurationWithMoment = (minutes: number): string => {
  if (!minutes || minutes <= 0) {
    return '0м';
  }

  const duration = moment.duration(minutes, 'minutes');
  const hours = Math.floor(duration.asHours());
  const remainingMinutes = duration.minutes();

  if (hours === 0) {
    return `${remainingMinutes} мин.`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${remainingMinutes} мин.`;
};