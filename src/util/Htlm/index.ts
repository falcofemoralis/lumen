import { decode } from 'html-entities';

export const decodeHtml = (text?: string): string => {
  if (!text) {
    return '';
  }

  return decode(text);
};
