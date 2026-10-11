import { FilmCardInterface } from 'Type/FilmCard.interface';
import { buildFilmSubtitle, subtitleFromFilm } from 'Util/Film/subtitle';
import { FilmInterface } from 'Type/Film.interface';
import { FilmType } from 'Type/FilmType.type';
import { ContentSource } from '../types/ContentSource';
import { SourceAdapter } from '../types/SourceAdapter';
import { UnifiedExternalId, UnifiedExternalIdType, UnifiedFilm, createUnifiedFilmId } from '../types/UnifiedFilm';
import { ANIXART_BASE_URL, AnixartRelease, anixartReleaseId, getAnixartRelease, requestAnixart } from './AnixartApi';

export const classifyAnixart = (release: Pick<AnixartRelease, 'country'>) =>
  release.country?.split(/[,;]/).some((country) => country.trim() === 'Китай') ? FilmType.DONGHUA : FilmType.ANIME;
export const anixartAgeRating = (code?: number): string | undefined =>
  code === undefined ? undefined : ({ 1: '0+', 2: '6+', 3: '12+', 4: '16+', 5: '18+' } as Record<number, string>)[code];
const releaseStatus = (release: AnixartRelease) => release.status?.id || release.status_id;
const releaseCategory = (release: AnixartRelease) => release.category?.id || release.category_id;
const hasReleasedEpisodes = (release: AnixartRelease) => (release.episodes_released ?? 0) > 0;
const seriesInfo = (release: AnixartRelease) => {
  const status = releaseStatus(release);
  const episodic = releaseCategory(release) !== 2;
  if (!episodic) return '';
  return [
    releaseCategory(release) === 3 ? 'OVA' : '',
    episodic && hasReleasedEpisodes(release)
      ? `Серия ${release.episodes_released} · ${release.episodes_released} / ${release.episodes_total || '?'} серий` : '',
    status === 1 ? 'Завершён'
      : status === 2 || (status === 3 && hasReleasedEpisodes(release)) ? 'Выходит'
        : status === 3 ? 'В ожидании' : release.status?.name,
  ].filter(Boolean).join(' · ');
};
export const anixartToCard = (release: AnixartRelease): FilmCardInterface => ({
  id: 'ANIXART:' + release.id, link: ANIXART_BASE_URL + '/release/' + release.id,
  title: release.title_ru, originalTitle: release.title_original, poster: release.image,
  subtitle: buildFilmSubtitle(release.year, release.country?.split(/[,;]/), release.genres?.split(/[,;]/)),
  type: classifyAnixart(release), info: seriesInfo(release), isEpisodic: releaseCategory(release) ? releaseCategory(release) !== 2 : undefined,
  isPendingRelease: hasReleasedEpisodes(release) ? false : releaseStatus(release) ? releaseStatus(release) === 3 : undefined,
  externalIds: { imdb: release.imdb_id, kinopoisk: release.kinopoisk_id ? String(release.kinopoisk_id) : undefined },
  ratingSourceType: ContentSource.ANIXART, ratingFilmId: String(release.id), ratings: {},
});
export const anixartToFilm = (release: AnixartRelease): FilmInterface => ({
  ...anixartToCard(release), ratings: [], releaseDate: release.year, description: release.description, age: anixartAgeRating(release.age_rating),
  countries: release.country ? release.country.split(/[,;]/).map((name) => ({ name: name.trim(), link: ANIXART_BASE_URL + '/catalog?country=' + encodeURIComponent(name.trim()) })) : [],
  genres: Array.from(new Set(release.genres?.split(/[,;]/).map((name) => name.trim()).filter(Boolean) ?? [])).map((name) => ({ name, link: ANIXART_BASE_URL + '/catalog?genre=' + encodeURIComponent(name) })),
  seriesInfo: seriesInfo(release), duration: release.duration ? `${release.duration} мин` : undefined,
  mainRating: release.grade ? { name: 'Anixart', rating: release.grade * 2, votes: release.vote_count, text: 'Anixart' } : undefined,
  directors: release.director ? release.director.split(/[,;]/).map(name => ({ name: name.trim(), photo: '', isDirector: true })).filter(person => person.name) : undefined,
  voices: [], hasVoices: true, hasSeasons: releaseCategory(release) !== 2,
  isRestricted: release.is_play_disabled || release.is_deleted,
  franchise: release.related_releases?.filter(item => !item.is_deleted)
    .sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0))
    .map(item => ({ name: item.title_ru, year: item.year ?? '', rating: item.grade ? (item.grade * 2).toFixed(1) : '',
      link: item.id === release.id ? '' : ANIXART_BASE_URL + '/release/' + item.id })),
  related: release.recommended_releases?.map(anixartToCard),
});
const ids = (film: { externalIds?: FilmInterface['externalIds'] }): UnifiedExternalId[] => {
  const result: UnifiedExternalId[] = [];
  if (film.externalIds?.imdb) result.push({ type: UnifiedExternalIdType.IMDB, value: film.externalIds.imdb });
  if (film.externalIds?.kinopoisk) result.push({ type: UnifiedExternalIdType.KINOPOISK, value: film.externalIds.kinopoisk });
  return result;
};
const normalize = (card: FilmCardInterface): UnifiedFilm => {
  const externalIds = ids(card);
  const year = Number(card.subtitle.match(/\b(?:19|20)\d{2}\b/)?.[0]) || undefined;
  return {
    id: createUnifiedFilmId(externalIds, card.originalTitle, card.title, year, card.type, card.id),
    title: card.title, originalTitle: card.originalTitle, year, type: card.type, poster: card.poster,
    info: card.info, ratings: card.ratings, subtitle: card.subtitle,
    isPendingRelease: card.isPendingRelease,
    sources: [{ source: ContentSource.ANIXART, link: card.link, nativeId: anixartReleaseId(card.link), externalIds }],
  };
};
const AnixartSourceAdapter: SourceAdapter = {
  source: ContentSource.ANIXART, name: 'Anixart',
  async getFilm(link, options) {
    const id = anixartReleaseId(link);
    const release = options?.includeRelated ? (await requestAnixart('/release/' + id)).release : await getAnixartRelease(id);
    return release ? anixartToFilm(release) : null;
  },
  async getFilmRatings() { return {}; },
  async getFilms(link, page) {
    const url = new URL(link);
    if (url.hostname !== 'anixart-app.com') throw new Error('Invalid Anixart catalog');
    const country = url.searchParams.get('country');
    const genre = url.searchParams.get('genre');
    const category = url.searchParams.get('category_id') === '3' ? 3 : undefined;
    const homeTab = url.searchParams.get('homeTab');
    const homeFilter = homeTab === 'soon' ? { status_id: 3, sort: 2 }
      : homeTab === 'popular' ? { sort: 3 }
        : homeTab === 'slider' ? { sort: 3, start_year: new Date().getFullYear() - 1 } : { sort: 0 };
    const data = homeTab === 'watching'
      ? await requestAnixart('/discover/watching/' + Math.max(0, page - 1))
      : await requestAnixart('/filter/' + Math.max(0, page - 1) + '?extended_mode=true', {
        ...(homeTab ? homeFilter : {}),
        ...(country ? { country } : {}), ...(genre ? { genres: [genre] } : {}), ...(category ? { category_id: category } : {}),
      });
    return { films: (data.content ?? []).filter((release) => !release.is_deleted).map(anixartToCard), totalPages: data.total_page_count && data.total_page_count > 0 ? Math.max(page, data.total_page_count) : (data.content?.length ?? 0) >= 25 ? page + 1 : page };
  },
  async search(query, page) {
    const data = await requestAnixart('/search/releases/' + Math.max(0, page - 1), { query, searchBy: 0 });
    return { films: (data.content ?? []).filter((release) => !release.is_deleted).map(anixartToCard), totalPages: data.total_page_count && data.total_page_count > 0 ? Math.max(page, data.total_page_count) : (data.content?.length ?? 0) >= 25 ? page + 1 : page };
  },
  normalizeFilmCard: normalize,
  normalizeFilm(film) { return { ...normalize({ ...film, ratings: Object.fromEntries((film.ratings ?? []).flatMap((rating) => rating.name === 'IMDb' ? [['imdb', rating.rating]] : rating.name === 'Кинопоиск' ? [['kinopoisk', rating.rating]] : [])), subtitle: subtitleFromFilm(film), info: film.seriesInfo }), description: film.description }; },
  getExternalIds: ids,
};
export default AnixartSourceAdapter;
