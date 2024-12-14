import * as cheerio from 'cheerio';

export const parseHtml = (str: string): cheerio.CheerioAPI => {
  return cheerio.load(str, {
    xmlMode: true,
    xml: {
      decodeEntities: false,
    },
  });
};
