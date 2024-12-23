import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmType } from 'Type/FilmType.type';
import { SeasonInterface } from 'Type/FilmVoice.interface';
import { HTMLElementInterface } from 'Util/Parser';

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

export const decodeUrl = (str: string): string => {
  try {
    if (!str.startsWith('#h')) {
      return str;
    }
    let replace = str.replace('#h', '');
    let i = 0;
    while (i < 20 && replace.includes('//_//')) {
      const indexOf = replace.indexOf('//_//');
      if (indexOf > -1) {
        replace = replace.replace(replace.substring(indexOf, indexOf + 21), '');
      }
      // eslint-disable-next-line no-plusplus -- Requires for decoding
      i++;
    }

    return atob(replace);
  } catch (e) {
    console.error(e);

    return str;
  }
};

export const parseStreams = (streams: string | null): FilmStreamInterface[] => {
  const parsedStreams: FilmStreamInterface[] = [];

  if (streams && streams.length > 0) {
    const decodedStreams = decodeUrl(streams);
    const split = decodedStreams.split(',');

    split.forEach((str) => {
      try {
        if (str.includes(' or ')) {
          parsedStreams.push({
            url: str.split(' or ')[1],
            quality: str.substring(1, str.indexOf(']')),
          });
        } else {
          parsedStreams.push({
            url: str.substring(str.indexOf(']') + 1),
            quality: str.substring(1, str.indexOf(']')),
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  return parsedStreams;
};

export const parseSeasons = (
  root: HTMLElementInterface,
): {
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

  // root.querySelectorAll('li.b-simple_season__item').forEach((el, idx) => {
  //   const seasonId = el.attributes['data-tab_id'] ?? '';
  //   const episodes: EpisodeInterface[] = [];

  //   $(`#simple-episodes-list-${seasonId}`).each((_idx, list) => {
  //     $(list)
  //       .find('li.b-simple_episode__item')
  //       .each((_idx, ep) => {
  //         if ($(ep).hasClass('active')) {
  //           lastWatch.lastSeasonId = $(ep).attr('data-season_id') ?? '1';
  //           lastWatch.lastEpisodeId = $(ep).attr('data-episode_id') ?? '1';
  //         }

  //         episodes.push({
  //           name: $(ep).text(),
  //           episodeId: $(ep).attr('data-episode_id') ?? '',
  //         });
  //       });
  //   });

  //   const season: SeasonInterface = {
  //     name: $(el).text(),
  //     seasonId: $(el).attr('data-tab_id') ?? '',
  //     episodes,
  //   };

  //   seasons.push(season);
  // });

  return {
    seasons,
    ...lastWatch,
  };
};
