import * as cheerio from 'cheerio';

export const parseHtml = (html: string): cheerio.CheerioAPI => {
  return cheerio.load(html);
};
