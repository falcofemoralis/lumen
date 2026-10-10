import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { ContentSource } from '../types/ContentSource';
import { SourceResolver } from './SourceResolver';
import { getRegisteredUnifiedFilm, registerUnifiedFilm } from '../search/UnifiedFilmRegistry';
import { SourceAdapter } from '../types/SourceAdapter';
import { withDeadline } from '../request';

export class SourceRouter {
  private readonly adapters: Map<ContentSource, SourceAdapter>;

  constructor(adapters: SourceAdapter[]) {
    this.adapters = new Map(
      adapters.map((adapter) => [adapter.source, adapter]),
    );
  }

  private readonly matches = new Map<string, { time: number; value: Promise<FilmInterface | null> }>();

  async getFilmForSource(film: FilmInterface, source: ContentSource, strict = false, background = false): Promise<FilmInterface | null> {
    const target = this.getAdapter(source);
    if (!target) return null;
    const key = film.link + ':' + source + ':' + strict;
    const cached = this.matches.get(key);
    if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.value;
    const value = withDeadline((async () => {
      const baseAdapter = this.getAdapterForLink(film.link) ?? this.getAdapter(ContentSource.REZKA);
      if (!baseAdapter) return null;
      const base = baseAdapter.normalizeFilm(film);
      const resolver = new SourceResolver(Array.from(this.adapters.values()));
      const registered = getRegisteredUnifiedFilm(film.link);
      const registeredSource = registered?.sources.find((item) => item.source === source);
      const candidates = registeredSource
        ? [await target.getFilm(registeredSource.link, { background })]
        : await (async () => {
          const result = await (target.searchCandidates ? target.searchCandidates(film.title, 1) : target.search(film.title, 1, { background }));
          const titleKey = (title: string) => title.normalize('NFKC').toLowerCase()
            .replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();
          const cards = result.films.filter((card) => {
            const normalized = target.normalizeFilmCard(card);
            return resolver.isSameFilm(base, normalized) || (
              base.year && base.year === normalized.year && titleKey(base.title) === titleKey(normalized.title)
            );
          });
          if (cards.length > 3) return [];
          const detailed = await Promise.all(cards.map((card) => target.getFilm(card.link, { background })));
          return detailed.filter((candidate) => candidate && resolver.isSameFilm(base, target.normalizeFilm(candidate)));
        })();
      const candidate = candidates.length === 1 ? candidates[0] : null;
      if (!candidate || !resolver.isSameFilm(base, target.normalizeFilm(candidate))) return null;
      const merged = resolver.deduplicate([base, target.normalizeFilm(candidate)]);
      merged.forEach(registerUnifiedFilm);
      return candidate;
    })(), 12_000, 'Дополнительный источник не ответил вовремя.').catch((error) => {
      this.matches.delete(key);
      if (strict) throw error;
      return null;
    });
    this.matches.set(key, { time: Date.now(), value });
    return value;
  }

  async resolvePreferredFilm(film: FilmInterface): Promise<FilmInterface> {
    const isZona = this.getAdapterForLink(film.link)?.source === ContentSource.ZONA;
    const zonaFilm = isZona ? film : await this.getFilmForSource(film, ContentSource.ZONA);
    if (!zonaFilm) return film;
    const rezkaFilm = isZona ? await this.getFilmForSource(film, ContentSource.REZKA) : film;
    if (!rezkaFilm) return { ...zonaFilm, libraryId: film.libraryId ?? film.id };
    const ratingKey = (name: string) => name.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/[\s:]+/g, '');
    const zonaRatings = zonaFilm.ratings ?? [];
    const extraRatings = (rezkaFilm.ratings ?? []).filter((rating) =>
      ['imdb', 'кинопоиск', 'kinopoisk'].includes(ratingKey(rating.name))
      && !zonaRatings.some((item) => ratingKey(item.name) === ratingKey(rating.name)));
    const ratings = [...zonaRatings, ...extraRatings].map((rating) => {
      const external = rezkaFilm.ratings?.find((item) => ratingKey(item.name) === ratingKey(rating.name));
      const votes = external?.votes;
      return {
        ...rating,
        votes: rating.votes ?? (votes !== undefined && Number.isFinite(votes) && votes >= 0 ? votes : undefined),
        link: rating.link ?? external?.link,
      };
    });
    if (rezkaFilm.mainRating?.name === 'Rezka') {
      ratings.push({ ...rezkaFilm.mainRating, votes: rezkaFilm.mainRating.votes, link: rezkaFilm.mainRating.link ?? rezkaFilm.link });
    }
    const normalizeName = (name: string) => name.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').trim();
    const enrichPeople = (people: FilmInterface['actors'], additional: FilmInterface['actors']) => (
      (people ?? []).map((person) => {
        const matches = (additional ?? []).filter((item) => normalizeName(item.name) === normalizeName(person.name));
        return matches.length === 1 ? { ...person, link: matches[0].link ?? person.link } : person;
      })
    );
    return {
      ...zonaFilm,
      libraryId: film.libraryId ?? film.id,
      metadataSourceFilm: rezkaFilm,
      metadataSourceName: 'HDRezka',
      additionalInfo: [...(zonaFilm.additionalInfo ?? []), 'Комментарии, трейлеры и ссылки людей: HDRezka'],
      bookmarks: rezkaFilm.bookmarks,
      actors: enrichPeople(zonaFilm.actors, rezkaFilm.actors),
      directors: enrichPeople(zonaFilm.directors, rezkaFilm.directors),
      ratings: ratings.length ? ratings : undefined,
    };
  }

  async resolvePreferredCard(card: FilmCardInterface, strict = false, options?: { deferSeriesInfo?: boolean }): Promise<FilmCardInterface> {
    const adapter = this.getAdapterForLink(card.link);
    if (adapter?.source === ContentSource.ZONA) {
      try {
        const details = await adapter.getFilm(card.link, options);
        if (details) registerUnifiedFilm(adapter.normalizeFilm(details));
        if (!details && strict) throw new Error('Bookmark metadata unavailable');
        return details ? {
          ...card, contentTypePending: false, poster: details.poster || card.poster, title: details.title, type: details.type, info: details.seriesInfo ?? card.info,
          originalTitle: details.originalTitle, externalIds: details.externalIds,
          ratings: {
            ...card.ratings,
            imdbPending: false,
            ...Object.fromEntries((details.ratings ?? []).flatMap((rating) =>
              rating.name === 'IMDb' ? [['imdb', rating.rating]]
                : rating.name === 'Кинопоиск' ? [['kinopoisk', rating.rating]] : [])),
          },
          ratingSourceType: ContentSource.ZONA, ratingFilmId: card.link,
        } : card;
      } catch (error) { if (strict) throw error; return card; }
    }
    const rezka = this.getAdapter(ContentSource.REZKA);
    if (!rezka) return card;
    try {
      const film = await rezka.getFilm(card.link, { background: true });
      if (!film) { if (strict) throw new Error('Bookmark metadata unavailable'); return card; }
      const zona = await this.getFilmForSource(film, ContentSource.ZONA, strict, true);
      if (!zona) return {
        ...card, poster: film.poster || card.poster, type: film.type, info: film.seriesInfo ?? card.info,
        ratingSourceType: ContentSource.REZKA, ratingFilmId: film.id,
        ratings: {
          ...card.ratings,
          ...Object.fromEntries((film.ratings ?? []).flatMap((rating) =>
            rating.name === 'IMDb' ? [['imdb', rating.rating]]
              : rating.name === 'Кинопоиск' ? [['kinopoisk', rating.rating]] : [])),
        },
      };
      return {
        ...card,
        link: zona.link,
        title: zona.title,
        originalTitle: zona.originalTitle,
        poster: zona.poster || card.poster,
        type: zona.type,
        info: zona.seriesInfo ?? card.info,
        externalIds: zona.externalIds,
        ratings: {
          ...card.ratings,
          ...Object.fromEntries((zona.ratings ?? []).flatMap((rating) =>
            rating.name === 'IMDb' ? [['imdb', rating.rating]]
              : rating.name === 'Кинопоиск' ? [['kinopoisk', rating.rating]] : [])),
        },
        ratingSourceType: ContentSource.REZKA,
        ratingFilmId: film.id,
      };
    } catch (error) {
      if (strict) throw error;
      return card;
    }
  }

  getAdapter(source: ContentSource): SourceAdapter | null {
    return this.adapters.get(source) ?? null;
  }

  getAdapterForLink(link: string): SourceAdapter | null {
    try {
      const url = new URL(link);

      if (url.hostname === 'w1.zona.im' || url.hostname.endsWith('.zona.im')) {
        return this.getAdapter(ContentSource.ZONA);
      }
    } catch {
      return null;
    }

    return null;
  }
}
