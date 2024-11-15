import { CheerioAPI, Element } from 'cheerio';
import FilmCard from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { FilmVideoStream } from 'Type/FilmVideo.interface';

export const utils = {
  parseFilmCard($: CheerioAPI, el: Element): FilmCard {
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
    const title = $(el).find('.b-content__inline_item-link a').text() ?? '';
    const poster = $(el).find('.b-content__inline_item-cover img').attr('src') ?? '';

    return {
      id,
      link,
      type,
      title,
      poster,
    };
  },

  parseStreams(streams: string | null): FilmVideoStream[] {
    const parsedStreams: FilmVideoStream[] = [];

    if (streams && streams.length > 0) {
      const decodedStreams = this.decodeUrl(streams);
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
  },

  decodeUrl(str: string): string {
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
  },
};
