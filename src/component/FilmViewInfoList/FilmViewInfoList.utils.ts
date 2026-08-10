/**
 * The position comes from the raw text node next to the link, so it can carry
 * brackets/spaces around it, or be the literal `undefined` when there is none.
 */
export const formatInfoListPosition = (position?: string): string => {
  const label = position?.replace(/[()]/g, '').trim() ?? '';

  return label === 'undefined' ? '' : label;
};
