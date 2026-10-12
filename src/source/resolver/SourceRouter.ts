import { enqueueBookmarkRequest } from '../search/BookmarkRequests';
import { seriesStatusLabel, supplementSeriesStatus } from 'Util/Film/posterStatus';
import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { subtitleFromFilm } from 'Util/Film/subtitle';
import { ContentSource } from '../types/ContentSource';
import { isSourceEnabled, sourceForLink } from '../types/SourceSelection';
import { SourceResolver } from './SourceResolver';
import { isTitleVariantCandidate } from './titleCandidates';
import { getRegisteredUnifiedFilm, registerUnifiedFilm } from '../search/UnifiedFilmRegistry';
import { SourceAdapter } from '../types/SourceAdapter';
import { withDeadline } from '../request';
import { FilmType } from 'Type/FilmType.type';

export class SourceRouter {
  private readonly adapters: Map<ContentSource, SourceAdapter>;

  constructor(adapters: SourceAdapter[]) {
    this.adapters = new Map(
      adapters.map((adapter) => [adapter.source, adapter]),
    );
  }

  private readonly matches = new Map<string, { time: number; value: Promise<FilmInterface | null> }>();

  async getFilmForSource(film: FilmInterface, source: ContentSource, strict = false, background = false, includeSeriesInfo = false): Promise<FilmInterface | null> {
    const target = this.getAdapter(source);
    if (!target) return null;
    const key = film.link + ':' + source + ':' + strict + ':' + includeSeriesInfo;
    const cached = this.matches.get(key);
    if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.value;
    const value = withDeadline((async () => {
      const baseAdapter = this.adapters.get(sourceForLink(film.link));
      if (!baseAdapter) return null;
      const base = baseAdapter.normalizeFilm(film);
      const resolver = new SourceResolver(Array.from(this.adapters.values()));
      const registered = getRegisteredUnifiedFilm(film.link);
      const registeredSource = registered?.sources.find((item) => item.source === source);
      const candidates = registeredSource
        ? [await target.getFilm(registeredSource.link, { background, includeSeriesInfo: includeSeriesInfo && source === ContentSource.REZKA && film.hasSeasons })]
        : await (async () => {
          const search = (query: string) => target.searchCandidates ? target.searchCandidates(query, 1) : target.search(query, 1, { background });
          let result = await search(film.title);
          const shortTitle = film.title.split(':')[0].trim();
          if (!result.films.length && shortTitle !== film.title) result = await search(shortTitle);
          const titleKey = (title: string) => title.normalize('NFKC').toLowerCase()
            .replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();
          const selectCards = (result: { films: FilmCardInterface[] }) => result.films.filter((card) => {
            const normalized = target.normalizeFilmCard(card);
            return resolver.isSameFilm(base, normalized) || isTitleVariantCandidate(base, normalized) || (
              base.year && base.year === normalized.year && (
                titleKey(base.title) === titleKey(normalized.title)
                || ((baseAdapter.source === ContentSource.ANIXART || target.source === ContentSource.ANIXART)
                  && (base.type === FilmType.ANIME || base.type === FilmType.DONGHUA)
                  && base.type === normalized.type)
              )
            );
          });
          let cards = selectCards(result);
          // Localized anime titles may differ completely. Search the exact original
          // aliases only when the localized query produced no viable candidates.
          if (!cards.length && film.originalTitle) {
            for (const title of film.originalTitle.split(/\s+[\/|]\s+/).slice(0, 2)) {
              const originalResult = await search(title.trim());
              cards = selectCards(originalResult);
              if (cards.length) break;
            }
          }
          if (cards.length > 3) return [];
          const detailed = await Promise.all(cards.map((card) => target.getFilm(card.link, { background, includeSeriesInfo: includeSeriesInfo && source === ContentSource.REZKA && film.hasSeasons })));
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

  async getAnixartExternalRatings(releaseId: string) {
    if (!/^\d+$/.test(releaseId)) throw new Error('Invalid Anixart release ID');
    const film = await this.getAdapter(ContentSource.ANIXART)?.getFilm('https://anixart-app.com/release/' + releaseId);
    if (!film) return {};
    const extra = await this.getFilmForSource(film, ContentSource.REZKA, true, true);
    const result: { imdb?: number; kinopoisk?: number } = {};
    for (const rating of extra?.ratings ?? []) {
      if (!Number.isFinite(rating.rating) || rating.rating <= 0) continue;
      const name = rating.name.toLowerCase().replace(/[\s:]+/g, '');
      if (name === 'imdb') result.imdb = rating.rating;
      if (name === 'кинопоиск' || name === 'kinopoisk') result.kinopoisk = rating.rating;
    }
    return result;
  }

  async resolvePreferredFilm(film: FilmInterface): Promise<FilmInterface> {
    const primary = (film.type === FilmType.ANIME || film.type === FilmType.DONGHUA) && this.getAdapter(ContentSource.ANIXART)
      ? ContentSource.ANIXART : ContentSource.ZONA;
    const isZona = this.getAdapterForLink(film.link)?.source === primary;
    const zonaFilm = isZona ? film : await this.getFilmForSource(film, primary);
    if (!zonaFilm) return film;
    const rezkaFilm = !isZona && (this.getAdapterForLink(film.link)?.source ?? ContentSource.REZKA) === ContentSource.REZKA
      ? film : await this.getFilmForSource(zonaFilm, ContentSource.REZKA);
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
      (people?.length ? people : additional ?? []).map((person) => {
        const matches = (additional ?? []).filter((item) => normalizeName(item.name) === normalizeName(person.name));
        return matches.length === 1 ? { ...person, link: person.link ?? matches[0].link } : person;
      })
    );
    return {
      ...zonaFilm,
      libraryId: film.libraryId ?? film.id,
      seriesInfo: supplementSeriesStatus(zonaFilm.seriesInfo, rezkaFilm.seriesInfo),
      metadataSourceFilm: rezkaFilm,
      metadataSourceName: 'HDRezka',
      additionalInfo: [...(zonaFilm.additionalInfo ?? []), primary === ContentSource.ANIXART ? 'Дополнительные рейтинги, трейлеры и ссылки людей: HDRezka' : 'Комментарии, трейлеры и ссылки людей: HDRezka'],
      bookmarks: rezkaFilm.bookmarks,
      franchise: zonaFilm.franchise?.length ? zonaFilm.franchise : rezkaFilm.franchise,
      schedule: zonaFilm.schedule?.length ? zonaFilm.schedule : rezkaFilm.schedule,
      related: zonaFilm.related?.length ? zonaFilm.related : rezkaFilm.related,
      actors: primary === ContentSource.ZONA && rezkaFilm.actors?.length ? rezkaFilm.actors : enrichPeople(zonaFilm.actors, rezkaFilm.actors),
      directors: primary === ContentSource.ZONA && rezkaFilm.directors?.length ? rezkaFilm.directors : enrichPeople(zonaFilm.directors, rezkaFilm.directors),
      ratings: ratings.length ? ratings : undefined,
    };
  }

  async resolveBookmarkPrimary(card: FilmCardInterface): Promise<FilmCardInterface | null> {
    if (sourceForLink(card.link) !== ContentSource.REZKA) return this.resolvePreferredCard(card, true);
    const year = card.subtitle.match(/\b(?:18|19|20)\d{2}\b/)?.[0];
    if (!year && !Object.values(card.externalIds ?? {}).some(Boolean)) return null;
    const seed: FilmInterface = { ...card, releaseDate: year, ratings: [], voices: [], hasVoices: false, hasSeasons: false };
    const animation = card.type === FilmType.ANIME || card.type === FilmType.DONGHUA;
    for (const source of (animation ? [ContentSource.ANIXART, ContentSource.ZONA] : [ContentSource.ZONA]).filter(isSourceEnabled)) {
      const match = await this.getFilmForSource(seed, source, true, true);
      if (match) return this.resolvePreferredCard({ ...card, link: match.link }, true);
    }
    return null;
  }

  async resolvePreferredCard(card: FilmCardInterface, strict = false, options?: { deferSeriesInfo?: boolean }): Promise<FilmCardInterface> {
    const originalSource = sourceForLink(card.link);
    if (!isSourceEnabled(originalSource)) {
      const seed: FilmInterface = {
        ...card, releaseDate: card.subtitle.match(/\b(?:18|19|20)\d{2}\b/)?.[0],
        ratings: [], voices: [], hasVoices: false, hasSeasons: false,
      };
      const animation = card.type === FilmType.ANIME || card.type === FilmType.DONGHUA;
      const candidates = animation
        ? [ContentSource.ANIXART, ContentSource.ZONA, ContentSource.REZKA]
        : [ContentSource.ZONA, ContentSource.REZKA];
      for (const source of candidates.filter(isSourceEnabled)) {
        const match = await this.getFilmForSource(seed, source, strict, true);
        if (match) return this.resolvePreferredCard({ ...card, link: match.link }, strict, options);
      }
      if (strict) throw new Error('No enabled source matched this bookmark');
      return card;
    }
    const adapter = this.getAdapterForLink(card.link);
    if (adapter?.source === ContentSource.ZONA || adapter?.source === ContentSource.ANIXART) {
      try {
        let details = await adapter.getFilm(card.link, options);
        if (details && adapter.source === ContentSource.ZONA
          && (details.type === FilmType.ANIME || details.type === FilmType.DONGHUA)) {
          details = await this.getFilmForSource(details, ContentSource.ANIXART, strict, true) ?? details;
        }
        if (details && this.getAdapterForLink(details.link)?.source === ContentSource.ZONA
          && details.hasSeasons && details.seriesInfo && !seriesStatusLabel(details.seriesInfo)) {
          const native = details;
          const extra = await enqueueBookmarkRequest('bookmark-series-status:' + native.link,
            () => this.getFilmForSource(native, ContentSource.REZKA, false, true, true)).catch(() => null);
          details = { ...native, seriesInfo: supplementSeriesStatus(native.seriesInfo, extra?.seriesInfo) };
        }
        const nativeSource = details ? this.getAdapterForLink(details.link)?.source ?? adapter.source : adapter.source;
        if (details) registerUnifiedFilm((this.getAdapterForLink(details.link) ?? adapter).normalizeFilm(details));
        if (!details && strict) throw new Error('Bookmark metadata unavailable');
        return details ? {
          ...card, link: details.link, contentTypePending: false, poster: details.poster || card.poster, title: details.title, type: details.type, info: details.seriesInfo ?? card.info, isEpisodic: details.hasSeasons,
          originalTitle: details.originalTitle, externalIds: details.externalIds,
          isPendingRelease: details.isPendingRelease ?? card.isPendingRelease,
          subtitle: subtitleFromFilm(details) || card.subtitle,
          ratings: {
            ...card.ratings,
            imdbPending: false,
            ...Object.fromEntries((details.ratings ?? []).flatMap((rating) =>
              rating.name === 'IMDb' ? [['imdb', rating.rating]]
                : rating.name === 'Кинопоиск' ? [['kinopoisk', rating.rating]] : [])),
          },
          ratingSourceType: nativeSource, ratingFilmId: nativeSource === ContentSource.ANIXART ? new URL(details.link).pathname.split('/').pop() : details.link,
        } : card;
      } catch (error) { if (strict) throw error; return card; }
    }
    const rezka = this.getAdapter(ContentSource.REZKA);
    if (!rezka) return card;
    try {
      const film = await rezka.getFilm(card.link, { background: true, includeSeriesInfo: true });
      if (!film) { if (strict) throw new Error('Bookmark metadata unavailable'); return card; }
      const primary = (film.type === FilmType.ANIME || film.type === FilmType.DONGHUA) && this.getAdapter(ContentSource.ANIXART)
        ? ContentSource.ANIXART : ContentSource.ZONA;
      const zona = await this.getFilmForSource(film, primary, strict, true);
      if (!zona) return {
        ...card, poster: film.poster || card.poster, type: film.type, info: film.seriesInfo ?? card.info, isEpisodic: film.hasSeasons,
        subtitle: subtitleFromFilm(film) || card.subtitle,
        isPendingRelease: film.isPendingRelease ?? card.isPendingRelease,
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
        info: supplementSeriesStatus(zona.seriesInfo, film.seriesInfo) ?? film.seriesInfo ?? card.info,
        isEpisodic: zona.hasSeasons,
        subtitle: subtitleFromFilm(zona) || card.subtitle,
        isPendingRelease: zona.isPendingRelease ?? film.isPendingRelease ?? card.isPendingRelease,
        externalIds: zona.externalIds,
        ratings: {
          ...card.ratings,
          ...Object.fromEntries((zona.ratings ?? []).flatMap((rating) =>
            rating.name === 'IMDb' ? [['imdb', rating.rating]]
              : rating.name === 'Кинопоиск' ? [['kinopoisk', rating.rating]] : [])),
        },
        ratingSourceType: primary,
        ratingFilmId: primary === ContentSource.ANIXART ? new URL(zona.link).pathname.split('/').pop() : zona.link,
      };
    } catch (error) {
      if (strict) throw error;
      return card;
    }
  }

  getAdapter(source: ContentSource): SourceAdapter | null {
    return isSourceEnabled(source) ? this.adapters.get(source) ?? null : null;
  }

  getAdapterForLink(link: string): SourceAdapter | null {
    try {
      const url = new URL(link);
      if (url.hostname === 'anixart-app.com') return this.getAdapter(ContentSource.ANIXART);

      if (url.hostname === 'w1.zona.im' || url.hostname.endsWith('.zona.im')) {
        return this.getAdapter(ContentSource.ZONA);
      }
    } catch {
      return null;
    }

    return null;
  }
}
