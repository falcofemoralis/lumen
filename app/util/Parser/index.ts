import * as cheerio from 'cheerio';

export const parseHtml = (html: string): cheerio.CheerioAPI => {
  console.log(html.length);

  return cheerio.load(html);
};
