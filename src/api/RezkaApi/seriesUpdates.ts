import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { HTMLElementInterface } from 'Util/Parser';

const BLOCK_SELECTOR = '.b-seriesupdate__block';
// inferred from the site's BEM convention; collectSeriesUpdateRows falls back to
// climbing from the link elements when this class does not match
const ROW_SELECTOR = '.b-seriesupdate__block_list_item';
const LINK_SELECTOR = '.b-seriesupdate__block_list_link';

export const parseSeriesUpdateRow = (item: HTMLElementInterface): NotificationItemInterface => {
  const season = item.querySelector('.season')?.rawText ?? '';
  const episode = item.querySelector('.cell-2')?.rawText ?? '';
  const info = `${season} - ${episode}`;
  const itemLink = item.querySelector(LINK_SELECTOR);

  return {
    name: itemLink?.rawText ?? '',
    link: itemLink?.attributes.href ?? '',
    info,
  };
};

/**
 * All update rows of one date block (tracked and untracked). Primary path uses the
 * row class; if the site's markup differs, falls back to climbing from each link to
 * the first ancestor that contains the episode cell, stopping before the block
 * element (the block contains every row's cell, so it must never act as a row).
 */
export const collectSeriesUpdateRows = (block: HTMLElementInterface): HTMLElementInterface[] => {
  const rows = block.querySelectorAll(ROW_SELECTOR);

  if (rows.length > 0) {
    return rows;
  }

  return block.querySelectorAll(LINK_SELECTOR).map((link) => {
    let candidate = link.parentNode as HTMLElementInterface | null;

    while (candidate && candidate !== block && !candidate.querySelector('.cell-2')) {
      candidate = candidate.parentNode as HTMLElementInterface | null;
    }

    return candidate && candidate !== block
      ? candidate
      : link.parentNode as HTMLElementInterface;
  });
};

/**
 * Parses the home page's series-updates widget into date groups, with the row
 * collection strategy injected (account mode passes the `.tracked` selector).
 */
export const parseSeriesUpdateBlocks = (
  root: HTMLElementInterface,
  collectRows: (block: HTMLElementInterface) => HTMLElementInterface[]
): NotificationInterface[] => root.querySelectorAll(BLOCK_SELECTOR).map((el) => {
  const date = el.querySelector('.b-seriesupdate__block_date')?.rawText ?? '';

  return {
    date: date.replace(' развернуть', '').trim(),
    items: collectRows(el).map(parseSeriesUpdateRow),
  };
});
