// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { format } from 'date-fns/format';
import type { Locale } from 'date-fns/locale';
import { parseISO } from 'date-fns/parseISO';
import i18n from 'i18next';

type Options = Parameters<typeof format>[2]

let dateFnsLocale: Locale;
export const loadDateFnsLocale = () => {
  const primaryTag = i18n.language.split('-')[0];
  switch (primaryTag) {
    case 'en':
      dateFnsLocale = require('date-fns/locale/en-US').default;
      break;
    case 'ar':
      dateFnsLocale = require('date-fns/locale/ar').default;
      break;
    case 'ko':
      dateFnsLocale = require('date-fns/locale/ko').default;
      break;
    case 'es':
      dateFnsLocale = require('date-fns/locale/es').default;
      break;
    case 'fr':
      dateFnsLocale = require('date-fns/locale/fr').default;
      break;
    case 'hi':
      dateFnsLocale = require('date-fns/locale/hi').default;
      break;
    case 'ja':
      dateFnsLocale = require('date-fns/locale/ja').default;
      break;
    default:
      dateFnsLocale = require('date-fns/locale/en-US').default;
      break;
  }
};

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: dateFnsLocale,
  };

  return format(parseISO(date), dateFormat ?? 'MMM dd, yyyy', dateOptions);
};

export const convertSecondsToTime = (seconds: number): string => {
  // Hours, minutes and seconds
  const hrs = ~~(seconds / 3600);
  const mins = ~~((seconds % 3600) / 60);
  const secs = ~~seconds % 60;

  let ret = '';

  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? '0' : ''}`;
  }

  ret += `${mins}:${secs < 10 ? '0' : ''}`;
  ret += `${secs}`;

  return ret;
};

export const getFormattedDate = () => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
