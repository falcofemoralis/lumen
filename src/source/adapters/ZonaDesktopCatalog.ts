import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';

import { fetchZonaText } from '../request';
import { ContentSource } from '../types/ContentSource';

export interface ZonaDesktopFilm {
  id: string; name_id?: string; name_rus?: string; name_original?: string;
  year?: number; serial?: boolean; genre2?: string; genre_name?: string; country?: string;
  rating_imdb?: number; rating_kinopoisk?: number; rating_imdb_count?: number; rating_kinopoisk_count?: number;
  serial_ended?: boolean; serial_end_year?: number; description?: string; runtime?: number;
  persons?: string; country_id?: string; adult?: boolean; poster?: string; tor_count?: number;
}
const PAGE_SIZE = 60;
const endpoint = 'http://zsolr3.zonasearch.com/solr/movie/select/';
const docsByLink = new Map<string, ZonaDesktopFilm>();
let readOptions = () => ({ enabled: false, adult: false });
export const setZonaDesktopOptions = (read: typeof readOptions) => { readOptions = read; };
export const zonaDesktopOptions = () => readOptions();
export const zonaDesktopIdForLink = (link: string) => docsByLink.get(link)?.id;
export const zonaDesktopImage = (id: string | number, kind = 'film_240') => /^\d+$/.test(String(id))
  ? `https://img1.zonapic.com/images/${kind}/${Math.floor(Number(id) / 1000)}/${id}.jpg` : '';
export const escapeZonaQuery = (value: string) => value.replace(/[+\-&|!(){}\[\]^"~*?:\\/]/g, '\\$&');
const genres = (film: ZonaDesktopFilm) => new Set(String(film.genre2 ?? '').split(/[,\s]+/));
export const zonaDesktopType = (film: ZonaDesktopFilm): FilmType => {
  const ids = genres(film);

  return ids.has('1750') ? FilmType.ANIME : ids.has('14') ? FilmType.CARTOON
    : ['25', '26', '27', '28'].some(id => ids.has(id)) ? FilmType.TV_SHOW
      : film.serial ? FilmType.SERIES : FilmType.FILM;
};
export const zonaDesktopCard = (film: ZonaDesktopFilm): FilmCardInterface => {
  const slug = film.name_id || `kp-${ film.id}`;
  const link = `https://w1.zona.im/${ film.serial ? 'tvseries/' : 'movies/' }${encodeURIComponent(slug)}`;
  docsByLink.set(link, film);
  while (docsByLink.size > 1024) docsByLink.delete(docsByLink.keys().next().value!);

  return {
    id: `ZONA:${ slug}`, link, title: film.name_rus || film.name_original || film.id,
    originalTitle: film.name_original, type: zonaDesktopType(film),
    poster: film.poster || zonaDesktopImage(film.id),
    subtitle: [film.year, film.country, film.genre_name].filter(Boolean).join(', '),
    isEpisodic: !!film.serial, info: film.serial && film.serial_ended ? 'Завершён' : undefined,
    externalIds: { kinopoisk: String(film.id) }, ratingSourceType: ContentSource.ZONA, ratingFilmId: link,
    ratings: {
      ...(film.rating_imdb && film.rating_imdb > 0 ? { imdb: film.rating_imdb } : {}),
      ...(film.rating_kinopoisk && film.rating_kinopoisk > 0 ? { kinopoisk: film.rating_kinopoisk } : {}),
    },
  };
};
export const requestZonaDesktopFilms = async (query: string, page: number, sort = 'popularity desc,id asc') => {
  const options = zonaDesktopOptions();
  const q = `(${ query })${ options.adult ? '' : ' AND adult:false'}`;
  const fields = 'id,name_id,name_rus,name_original,year,serial,genre2,genre_name,country,'
    + 'rating_imdb,rating_kinopoisk,serial_ended,adult,tor_count';
  const params = new URLSearchParams({ q, wt: 'json', fl: fields, start: String((Math.max(1, page) - 1) * PAGE_SIZE),
    rows: String(PAGE_SIZE), sort });
  const data = JSON.parse(await fetchZonaText(`${endpoint }?${ params}`));
  if (!Array.isArray(data.response?.docs) || !Number.isFinite(data.response.numFound)) {
    throw new Error('Invalid Zona desktop catalog response');
  }
  const docs = (data.response.docs as ZonaDesktopFilm[]).filter(doc => doc && /^\d+$/.test(String(doc.id)));

  return { films: docs.map(zonaDesktopCard), totalPages: Math.max(1, Math.ceil(data.response.numFound / PAGE_SIZE)) };
};
const fetchZonaDesktopDetail = async (link: string, kinopoiskId?: string): Promise<FilmInterface | null> => {
  const cached = docsByLink.get(link);
  let doc: ZonaDesktopFilm | undefined;
  {
    const slug = decodeURIComponent(new URL(link).pathname.split('/').filter(Boolean).pop() ?? '');
    const query = /^kp-\d+$/.test(slug) ? `id:${ slug.slice(3)}` : `name_id:"${ escapeZonaQuery(slug) }"`;
    const detailQuery = kinopoiskId && /^\d+$/.test(kinopoiskId) ? `id:${kinopoiskId}`
      : cached ? `id:${escapeZonaQuery(cached.id)}` : query;
    const params = new URLSearchParams({ q: detailQuery,
      wt: 'json', rows: '1' });
    const data = JSON.parse(await fetchZonaText(`${endpoint }?${ params}`));
    doc = data.response?.docs?.[0];
  }
  if (!doc || (!zonaDesktopOptions().adult && doc.adult)) return null;
  const card = zonaDesktopCard(doc);
  const category = (key: string, value: string) => `https://w1.zona.im/catalog?${
    new URLSearchParams({ ...(key === 'person' ? {} : { kind: doc!.serial ? 'tvseries' : 'movies' }), [key]: value })}`;
  let persons: { r: number; i: number; name: string; o?: number }[] = [];
  try { persons = JSON.parse(doc.persons ?? '[]'); } catch { /* Provider may omit contributors. */ }
  const people = (role: number) => Array.isArray(persons) ? persons.filter(person => person.r === role && person.name)
    .sort((a, b) => (a.o ?? 0) - (b.o ?? 0)).map(person => ({ name: person.name,
      photo: zonaDesktopImage(person.i, 'actor'),
      link: category('person', String(person.i)) })) : [];

  return { ...card, link, catalogOnly: true, directors: people(1), actors: people(4),
    releaseDate: doc.year ? String(doc.year) : undefined,
    year: doc.year, description: doc.description, age: doc.adult ? '18+' : undefined,
    genres: (doc.genre_name ?? '').split(',').filter(Boolean).map((name, index) => ({
      name: name.trim(), link: category('genre', String(doc!.genre2 ?? '').split(/[,\s]+/)[index] ?? name.trim()) })),
    countries: (doc.country ?? '').split(',').filter(Boolean).map((name, index) => ({
      name: name.trim(),
      link: category('country', String(doc!.country_id ?? '').split(/[,\s]+/)[index] ?? name.trim()) })),
    ratings: [
      ...(doc.rating_imdb && doc.rating_imdb > 0 ? [{ name: 'IMDb', text: 'IMDb',
        rating: doc.rating_imdb, votes: doc.rating_imdb_count }] : []),
      ...(doc.rating_kinopoisk && doc.rating_kinopoisk > 0 ? [{ name: 'Кинопоиск', text: 'Кинопоиск',
        rating: doc.rating_kinopoisk,
        votes: doc.rating_kinopoisk_count }] : []),
    ], hasSeasons: !!doc.serial, hasVoices: false, voices: [] };
};

export const zonaDesktopSearch = (query: string, page: number) => {
  const escaped = escapeZonaQuery(query.trim());

  return requestZonaDesktopFilms(`tor_count:[1 TO *] AND (name_rus:(${ escaped
  }) OR name_original:(${ escaped }) OR name_eng:(${ escaped }))`, page);
};
export const getZonaDesktopCategory = (link: string, page: number) => {
  const params = new URL(link).searchParams;
  const clauses = ['tor_count:[1 TO *]'];
  const kind = params.get('kind');
  if (kind === 'movies' || kind === 'tvseries') clauses.push(`serial:${ kind === 'tvseries'}`);
  const genre = params.get('genre');
  const country = params.get('country');
  const person = params.get('person');
  if (genre && !/^\d+$/.test(genre)) throw new Error('Invalid Zona genre ID');
  if (genre) clauses.push(`genreId:${ genre}`);
  if (country && !/^\d+$/.test(country)) throw new Error('Invalid Zona country ID');
  if (country) clauses.push(`country_id:${ country}`);
  if (person && /^\d+$/.test(person)) clauses.push(`personId:${ person}`);

  return requestZonaDesktopFilms(clauses.join(' AND '), page);
};
export const mergeZonaCards = (primary: FilmCardInterface[], extra: FilmCardInterface[]) => {
  const seen = new Set(primary.flatMap(card => [card.link, card.externalIds?.kinopoisk].filter(Boolean)));

  return [...primary, ...extra.filter(card => {
    if (seen.has(card.link) || (card.externalIds?.kinopoisk && seen.has(card.externalIds.kinopoisk))) return false;
    seen.add(card.link);
    if (card.externalIds?.kinopoisk) seen.add(card.externalIds.kinopoisk);

    return true;
  })];
};
export const zonaDesktopCatalogForLink = (link: string, page: number) => {
  const path = new URL(link).pathname;
  const serial = path.includes('/tvseries');
  const clauses = ['tor_count:[1 TO *]', `serial:${ serial}`];
  const genreIds: Record<string, string> = { uzhasy: '1', fantastika: '2', boevik: '3', triller: '4', fentezi: '5',
    komediya: '6', melodrama: '7', drama: '8', myuzikl: '9', priklyucheniya: '10', semeinyi: '11',
    dokumentalnyi: '12', vestern: '13', multfilm: '14', kriminal: '16', detektiv: '17', voennyi: '19',
    istoriya: '23', biografiya: '22', anime: '1750' };
  const genre = path.match(/\/genre-([^/]+)/)?.[1];
  if (genre && genreIds[genre]) clauses.push(`genreId:${ genreIds[genre]}`);
  else if (genre) throw new Error('Unsupported Zona desktop genre');
  if (/\/country-/.test(path)) throw new Error('Unsupported Zona desktop country URL');
  const year = path.match(/\/year-(\d{4})(?:-to-(\d{4}))?(?:\/|$)/);
  if (year) clauses.push(`year:[${ year[1] } TO ${ year[2] ?? year[1] }]`);
  else if (path.includes('/year-')) throw new Error('Unsupported Zona desktop year range');

  return requestZonaDesktopFilms(clauses.join(' AND '), page,
    path.includes('/updates/') ? 'add_date desc,id asc'
      : path.includes('sort-year') ? 'year desc,id asc' : 'popularity desc,id asc');
};
const detailCache = new Map<string, { time: number; value: Promise<FilmInterface | null> }>();
export const getZonaDesktopDetail = (link: string, kinopoiskId?: string): Promise<FilmInterface | null> => {
  const key = `${zonaDesktopOptions().adult}:${kinopoiskId ?? link}`;
  const cached = detailCache.get(key);
  if (cached && Date.now() - cached.time < 5 * 60_000) return cached.value;
  const value = fetchZonaDesktopDetail(link, kinopoiskId).catch(error => { detailCache.delete(key); throw error; });
  detailCache.set(key, { time: Date.now(), value });
  while (detailCache.size > 256) detailCache.delete(detailCache.keys().next().value!);

  return value;
};

export const supplementZonaDetails = (film: FilmInterface, extra: FilmInterface | null): FilmInterface => {
  const id = film.externalIds?.kinopoisk;
  if (!extra || !id || id !== extra.externalIds?.kinopoisk) return film;
  const people = (primary: FilmInterface['actors'], additional: FilmInterface['actors']) => primary?.length
    ? primary.map(person => {
      const name = person.name.trim().toLowerCase();
      const match = additional?.filter(candidate => candidate.name.trim().toLowerCase() === name);

      return match?.length === 1 ? { ...person, link: person.link || match[0].link,
        photo: person.photo || match[0].photo } : person;
    }) : additional;

  return { ...film, poster: film.poster || extra.poster, actors: people(film.actors, extra.actors),
    directors: people(film.directors, extra.directors), description: film.description || extra.description };
};