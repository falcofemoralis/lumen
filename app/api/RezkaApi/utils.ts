import { CheerioAPI, Element } from 'cheerio';
import FilmCardInterface from 'Type/FilmCard.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmType } from 'Type/FilmType.type';
import { EpisodeInterface, SeasonInterface } from 'Type/FilmVoice.interface';

export const parseFilmCard = ($: CheerioAPI, el: Element): FilmCardInterface => {
  const parseType = (type: string = '') => {
    if (type.includes('films')) {
      return FilmType.Film;
    } else if (type.includes('series')) {
      return FilmType.Series;
    } else if (type.includes('cartoons')) {
      return FilmType.Multfilm;
    } else if (type.includes('animation')) {
      return FilmType.Anime;
    } else if (type.includes('show')) {
      return FilmType.TVShow;
    }

    return FilmType.Film;
  };

  const id = $(el).attr('data-id') ?? '';
  const link = $(el).find('.b-content__inline_item-link a').attr('href') ?? '';
  const type = parseType($(el).find('.cat').attr('class'));
  const poster = $(el).find('.b-content__inline_item-cover img').attr('src') ?? '';
  const title = $(el).find('.b-content__inline_item-link a').text() ?? '';
  const subtitle = $(el).find('.b-content__inline_item-link div').text() ?? '';
  const info = $(el).find('.b-content__inline_item-cover .info').text();

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

    for (const str of split) {
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
    }
  }

  return parsedStreams;
};

export const parseSeasons = (
  $: CheerioAPI
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

  $('li.b-simple_season__item').each((_idx, el) => {
    const seasonId = $(el).attr('data-tab_id') ?? '';
    const episodes: EpisodeInterface[] = [];

    $(`#simple-episodes-list-${seasonId}`).each((_idx, list) => {
      $(list)
        .find('li.b-simple_episode__item')
        .each((_idx, ep) => {
          if ($(ep).hasClass('active')) {
            lastWatch.lastSeasonId = $(ep).attr('data-season_id') ?? '1';
            lastWatch.lastEpisodeId = $(ep).attr('data-episode_id') ?? '1';
          }

          episodes.push({
            name: $(ep).text(),
            episodeId: $(ep).attr('data-episode_id') ?? '',
          });
        });
    });

    const season: SeasonInterface = {
      name: $(el).text(),
      seasonId: $(el).attr('data-tab_id') ?? '',
      episodes,
    };

    seasons.push(season);
  });

  return {
    seasons,
    ...lastWatch,
  };
};
