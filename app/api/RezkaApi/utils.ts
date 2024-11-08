import { CheerioAPI, Element } from 'cheerio';
import FilmCard from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';

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
};
