import { t } from 'i18n/translate';

/**
 * Whether an option's label answers what was typed into the search field.
 *
 * A plain case-insensitive substring test, with `ё` folded onto `е`: the options
 * are spelled the way the provider spells them, which is not always the way the
 * person searching would.
 */
export const matchesQuery = (label: string, query: string): boolean => {
  const normalize = (value: string) => value.trim().toLowerCase().replaceAll('ё', 'е');

  return normalize(label).includes(normalize(query));
};

/** How many labels the setting's subtitle names before it starts counting. */
export const SUMMARY_LIMIT = 3;

/**
 * What the setting reads under its title once something is selected. The
 * subtitle has no line limit of its own, and a list can run to a couple of
 * hundred options -- so past a few it counts the rest rather than naming them.
 */
export const buildSelectionSummary = (labels: string[]): string => {
  if (labels.length <= SUMMARY_LIMIT) {
    return labels.join(', ');
  }

  const named = labels.slice(0, SUMMARY_LIMIT).join(', ');

  // `amount` rather than `count`: i18next reads a `count` option as a request
  // for plural resolution and goes looking for suffixed keys.
  return `${named} ${t('and {{amount}} more', { amount: labels.length - SUMMARY_LIMIT })}`;
};
