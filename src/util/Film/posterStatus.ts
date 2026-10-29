import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
// Legacy local/cloud cards may still contain the standalone release label.
export const posterSeriesInfo = (card: Pick<FilmCardInterface, 'type' | 'info' | 'isEpisodic'>): string | undefined =>
  card.isEpisodic === false || card.type === FilmType.FILM || /^\s*вышел\s*$/i.test(card.info ?? '') ? undefined : card.info;
export const seriesStatusLabel = (info?: string): string | undefined =>
  /заверш[её]н|закончен|окончен/i.test(info ?? '') ? 'завершён'
    : /выходит/i.test(info ?? '') ? 'выходит' : undefined;
export const supplementSeriesStatus = (info?: string, additional?: string): string | undefined => {
  if (!info) return additional;
  if (seriesStatusLabel(info)) return info;
  const status = seriesStatusLabel(additional);
  return status ? [info, status].filter(Boolean).join(' • ') : info;
};