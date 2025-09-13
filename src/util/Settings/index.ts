import t from 'i18n/t';
import { convertBooleanToString } from 'Util/Type';

export const yesNoOptions = [
  {
    value: convertBooleanToString(true),
    label: t('Yes'),
  },
  {
    value: convertBooleanToString(false),
    label: t('No'),
  },
];
